import React, {useEffect, useState} from "react";
import {ApolloError, useApolloClient, useMutation} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Button, Divider, Flex, Group, Loader, Stack, Table, Text} from "@mantine/core";
import {Dropzone} from "@mantine/dropzone";
import {IconFileCode, IconUpload, IconX} from "@tabler/icons-react";

import {
    ANNOTATIONS_QUERY,
    UPLOAD_RAW_SWC_MUTATION,
    UPLOAD_SWC_MUTATION,
    UploadRawSwcResponse,
    UploadRawSwcVariables,
    UploadSwcResponse,
    UploadUnregisteredSwcVariables
} from "../../graphql/annotation";
import {Annotation} from "../../models/annotation";
import {ReconstructionSpace} from "../../models/reconstructionSpace";
import {RawReconstructionUploadStatus} from "../../models/rawReconstructionUpload";
import {ReconstructionFilePreview} from "./ReconstructionFilePreview";
import {errorNotification, successNotification} from "./NotificationHelper";

const previewHeight = 300;

const dropMessage = new Map<ReconstructionSpace, string>();
dropMessage.set(ReconstructionSpace.Specimen, "Drop a specimen-space SWC reconstruction file, or click to browse for a file.");
dropMessage.set(ReconstructionSpace.Atlas, "Drop an atlas-space SWC reconstruction file, or click to browse for a file.");

const rawDropMessage = "Drop a raw specimen-space SWC reconstruction file, or click to browse for a file.";

type ReconstructionUploadProps = {
    reconstruction: Annotation;
    space: ReconstructionSpace;
    // Targets the raw specimen-space reconstruction instead of the refined one; only meaningful with Specimen.
    raw?: boolean;
    disabled?: boolean;
    disabledMessage?: string;
    // Fills the column beside the preview.
    details?: React.ReactNode;
}

export const ReconstructionUpload = observer(({reconstruction, space, raw, disabled, disabledMessage, details}: ReconstructionUploadProps) => {
    const client = useApolloClient();

    const [nodeCount, setNodeCount] = useState<[number, number]>(null);
    const [file, setFile] = useState<File>(null);

    // Keyed on disabled, not on reconstruction: a poll replaces the reconstruction object every few seconds while the
    // same one can move into review under a chosen file, which would otherwise be uploadable again once it returns.
    useEffect(() => {
        if (disabled) {
            setFile(null);
            setNodeCount(null);
        }
    }, [disabled]);

    const neuronLabel = reconstruction?.neuron.label;

    const spaceName = raw ? "raw specimen-space" : space == ReconstructionSpace.Atlas ? "atlas-space" : "specimen-space";

    const [uploadSwc, {loading: loadingSwc}] = useMutation<UploadSwcResponse, UploadUnregisteredSwcVariables>(UPLOAD_SWC_MUTATION,
        {
            variables: {
                uploadArgs: {
                    annotationId: reconstruction.id,
                    reconstructionSpace: space,
                    file: file
                }
            }, refetchQueries: [],
            onCompleted: () => onUploadComplete(),
            onError: (error) => onUploadError(error)
        });

    // A raw upload is parsed and stored before the API answers, so it can run long and can fail after the transfer
    // succeeds.  The API throws on failure, but the outcome is still confirmed from the returned attempt's status.
    const [uploadRawSwc, {loading: loadingRawSwc}] = useMutation<UploadRawSwcResponse, UploadRawSwcVariables>(UPLOAD_RAW_SWC_MUTATION,
        {
            variables: {
                uploadArgs: {
                    annotationId: reconstruction.id,
                    file: file
                }
            }, refetchQueries: [],
            onCompleted: (data) => onRawUploadComplete(data),
            onError: (error) => onUploadError(error)
        });

    const loading = loadingSwc || loadingRawSwc;

    const onUploadComplete = () => {
        successNotification("Reconstruction Added", `The reconstruction was added to ${neuronLabel}`);
        setFile(null);
    }

    const onRawUploadComplete = (data: UploadRawSwcResponse) => {
        const attempt = data?.uploadRawSwcData;

        if (attempt?.status == RawReconstructionUploadStatus.Accepted) {
            successNotification("Raw Reconstruction Uploaded", `The raw reconstruction for ${neuronLabel} was accepted.`);
            setFile(null);
        } else {
            errorNotification("Raw Reconstruction Upload Failed", attempt?.failureMessage || `The raw reconstruction for ${neuronLabel} was not accepted.`);
        }
    }

    const onUploadError = (error: ApolloError) => {
        const code = error.graphQLErrors?.[0]?.extensions?.code;

        if (code == 1009 || code == 1010) {
            errorNotification("Upload Not Allowed", error.graphQLErrors[0].message);
        } else if (error.cause && error.cause["statusCode"] == 401) {
            errorNotification("Unauthorized", `You are not authorized to upload the ${spaceName} reconstruction for ${neuronLabel}.`);
        } else if (raw) {
            const reason = error.graphQLErrors?.[0]?.message ?? error.message;
            errorNotification("Raw Reconstruction Upload Failed", `The raw reconstruction for ${neuronLabel} was not accepted${reason ? `: ${reason}` : "."}`);
        } else {
            errorNotification("Reconstruction Failed", `The reconstruction could not be added to ${neuronLabel}`);
        }
    }

    const performUpload = async (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.stopPropagation();

        if (disabled || loading) {
            return;
        }

        if (file.name.endsWith("swc")) {
            if (raw) {
                await uploadRawSwc();

                // Not refetchQueries on the mutation: those run only on success, and a failed attempt is recorded too.
                await client.refetchQueries({include: [ANNOTATIONS_QUERY]});
            } else {
                await uploadSwc();
            }
        }
    }

    const updateFiles = (acceptedFiles: File[]) => {
        // Replacing the file mid-upload would let the completion handler clear a file that was never sent.
        if (disabled || loading || !acceptedFiles?.length) {
            return;
        }

        if (acceptedFiles.some(s => !s.name.toLowerCase().endsWith(".swc"))) {
            errorNotification("Reconstruction File Mismatch", "Reconstruction files must be SWC");
            return;
        }

        setFile(acceptedFiles[0]);
    }

    let fileContents: React.JSX.Element;
    let header: React.JSX.Element;
    let filenames = "";

    if (file) {
        filenames = file.name;
        header = <Text fw={500}>{filenames}</Text>

        fileContents = (
            <Stack>
                <Table variant="vertical" layout="fixed" withTableBorder withColumnBorders>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Th bg="table-header" w={130}>Axon Nodes</Table.Th>
                            <Table.Td w={60} ta="end">{nodeCount ? nodeCount[0] : ""}</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Th bg="table-header" w={130}>Dendrite Nodes</Table.Th>
                            <Table.Td w={60} ta="end">{nodeCount ? nodeCount[1] : ""}</Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
                <Group>
                </Group>
            </Stack>
        );
    } else {
        header = (
            <Text size="sm" c="dimmed">
                {disabled ? disabledMessage : raw ? rawDropMessage : dropMessage.get(space)}
            </Text>
        );
    }

    const buttonText = raw ? (reconstruction.rawReconstruction ? "Replace" : "Upload") : space == ReconstructionSpace.Specimen ? (reconstruction.specimenSpaceReconstruction?.sourceUrl ? "Replace" : "Upload") : (reconstruction.atlasReconstruction.sourceUrl ? "Replace" : "Upload");

    const elementName = `upload-${raw ? "raw" : ReconstructionSpace[space].toLowerCase()}-space`;

    const haveFiles = file != null;

    const uploadDisabled = disabled || loading || !haveFiles;

    const updateButton = <Button size="sm" disabled={uploadDisabled} onClick={performUpload}>{buttonText}</Button>;

    const updateMessage = loading ? <Group><Loader type="dots" size="sm"/></Group> : null;

    return (
        <Flex>
            <Stack gap={0} mih={previewHeight} w={400} justify="stretch">
                <Dropzone style={{flexGrow: 1}} bd="0" radius={0} disabled={disabled || loading} onDrop={updateFiles}>
                    <Stack h="100%" justify="center">
                        <Group align="center">
                            <Dropzone.Accept>
                                <Flex mt={file != null ? 0 : 120} gap="sm" align="center" direction="row" wrap="nowrap">
                                    <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5}/>
                                    {header}
                                </Flex>
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <Flex mt={file != null ? 0 : 120} gap="sm" align="center" direction="row" wrap="nowrap">
                                    <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5}/>
                                    {header}
                                </Flex>
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <Flex mt={file != null ? 0 : 120} gap="sm" align="center" direction="row" wrap="nowrap">
                                    {file != null ? <IconUpload size={52} color="var(--mantine-color-green-6)" stroke={1.5}/> :
                                        <IconFileCode size={52} color="var(--mantine-color-dimmed)" stroke={1.5}/>}
                                    {header}
                                </Flex>
                            </Dropzone.Idle>
                        </Group>
                        {fileContents}
                    </Stack>
                </Dropzone>
                <Divider orientation="horizontal"/>
                <Group p={8} justify="end">
                    {updateMessage}
                    {updateButton}
                </Group>
            </Stack>
            <Divider orientation="vertical"/>
            <div style={{flex: 1, border: "none", height: `${previewHeight}px`, minWidth: 100, margin: 0}}>
                <ReconstructionFilePreview style={{height: `${previewHeight}px`, border: "none"}} elementName={elementName}
                                           file={file} onDrops={updateFiles} onInvalid={() => updateFiles(null)} onLoaded={setNodeCount}/>
            </div>
            <Divider orientation="vertical"/>
            <Stack w={400} gap={0}>
                {details}
            </Stack>
        </Flex>
    );
});
