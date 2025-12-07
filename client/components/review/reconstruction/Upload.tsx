import React, {useState} from "react";
import {observer} from "mobx-react-lite";
import {Button, Divider, Flex, Group, Loader, Stack, Table, Text} from "@mantine/core";
import {Dropzone} from "@mantine/dropzone";
import {IconFileCode, IconUpload, IconX} from "@tabler/icons-react";

import {FilePreview} from "./FilePreview";
import {errorNotification, successNotification} from "../../common/NotificationHelper";
import {ApolloError, useMutation} from "@apollo/client";
import {
    UPLOAD_JSON_MUTATION,
    UPLOAD_SWC_MUTATION, UploadJsonResponse, UploadSwcResponse,
    UploadUnregisteredJsonVariables,
    UploadUnregisteredSwcVariables
} from "../../../graphql/reconstruction";
import {ReconstructionSpace} from "../../../models/reconstructionSpace";
import {Reconstruction} from "../../../models/reconstruction";

const previewHeight = 300;

const dropMessage = new Map<ReconstructionSpace, string>();
dropMessage.set(ReconstructionSpace.Specimen, "Drop a specimen-space SWC or NMCP JSON reconstruction file, or click to browse for a file.");
dropMessage.set(ReconstructionSpace.Atlas, "Drop an atlas-space SWC or NMCP JSON reconstruction file, or click to browse for a file.");

export const Upload = observer(({reconstruction, space}: { reconstruction: Reconstruction, space: ReconstructionSpace }) => {
    const [nodeCount, setNodeCount] = useState<[number, number]>(null);
    const [file, setFile] = useState<File>(null);

    const [uploadJson, {loading: loadingJson}] = useMutation<UploadJsonResponse, UploadUnregisteredJsonVariables>(UPLOAD_JSON_MUTATION,
        {
            variables: {
                uploadArgs: {
                    reconstructionId: reconstruction.id,
                    reconstructionSpace: space,
                    file: file
                }
            }, refetchQueries: [],
            onCompleted: () => onUploadComplete(),
            onError: (error) => onUploadError(error)
        });

    const [uploadSwc, {loading: loadingSwc}] = useMutation<UploadSwcResponse, UploadUnregisteredSwcVariables>(UPLOAD_SWC_MUTATION,
        {
            variables: {
                uploadArgs: {
                    reconstructionId: reconstruction.id,
                    reconstructionSpace: space,
                    file: file
                }
            }, refetchQueries: [],
            onCompleted: () => onUploadComplete(),
            onError: (error) => onUploadError(error)
        });

    const onUploadComplete = () => {
        successNotification("Reconstruction Added", `The reconstruction was added to ${reconstruction?.neuron.label}`);
        setFile(null);
    }

    const onUploadError = (error: ApolloError) => {
        if (error.cause && error.cause["statusCode"] == 401) {
            errorNotification("Unauthorized", `You are not authorized to upload sample space reconstructions.`);
        } else {
            errorNotification("Reconstruction Failed", `The reconstruction could not be added to ${reconstruction?.neuron.label}`);
        }
    }

    const performUpload = async (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        evt.stopPropagation();

        if (file.name.endsWith("json")) {
            await uploadJson();
        } else if (file.name.endsWith("swc")) {
            await uploadSwc();
        }
    }

    const updateFiles = (acceptedFiles: File[]) => {
        if (!acceptedFiles?.length) {
            return;
        }

        if (acceptedFiles.some(s => !s.name.toLowerCase().endsWith(".swc") && !s.name.toLowerCase().endsWith(".json"))) {
            errorNotification("Reconstruction File Mismatch", "Reconstruction files must be JSON or SWC");
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
                {dropMessage.get(space)}
            </Text>
        );
    }

    const buttonText = space == ReconstructionSpace.Specimen ? (reconstruction.sourceUrl ? "Replace" : "Upload") : (reconstruction.atlasReconstruction.sourceUrl ? "Replace" : "Upload");

    const elementName = `upload-${ReconstructionSpace[space].toLowerCase()}-space`;

    const haveFiles = file != null;

    const disabled = loadingJson || loadingSwc || !haveFiles;

    const updateButton = <Button size="sm" disabled={disabled} onClick={performUpload}>{buttonText}</Button>;

    const updateMessage = loadingJson || loadingSwc ? <Group><Loader type="dots" size="sm"/></Group> : null;

    return (
        <Flex>
            <Stack gap={0} mih={previewHeight} w={400} justify="stretch">
                <Dropzone style={{flexGrow: 1}} bd="0" radius={0} onDrop={updateFiles}>
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
                                <Flex mt={file != null? 0 : 120} gap="sm" align="center" direction="row" wrap="nowrap">
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
                <FilePreview style={{height: `${previewHeight}px`, border: "none"}} elementName={elementName}
                             file={file} onDrops={updateFiles} onInvalid={() => updateFiles(null)} onLoaded={setNodeCount}/>
            </div>
            <Divider orientation="vertical"/>
            <Stack w={400}>
            </Stack>
        </Flex>
    );
});
