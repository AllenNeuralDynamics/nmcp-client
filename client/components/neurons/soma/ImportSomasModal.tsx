import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {useMutation} from "@apollo/client";
import {Modal, Alert, Stack, Button, Divider, Flex, Group} from '@mantine/core';
import {IconInfoCircle, IconUpload} from "@tabler/icons-react";

import {ImportSomasPanel} from "./ImportSomasPanel";
import {IMPORT_SOMAS_MUTATION, ImportSomasMutationResponse, ImportSomasVariables, NEURONS_QUERY} from "../../../graphql/neuron";
import {errorNotification, successNotification} from "../../common/NotificationHelper";
import {SpecimenShape} from "../../../models/specimen";
import {ImportSomaData} from "../../../viewmodel/importSomaData";
import {parseKeywords} from "../../../models/neuron";
import {ImportSomaFeatures} from "./ImportSomaFeatures";

type ImportSomasModalProps = {
    sample: SpecimenShape;
    onClose: () => void;
}

export const ImportSomasModal = observer((props: ImportSomasModalProps) => {
    const [importData] = useState<ImportSomaData>(new ImportSomaData());

    const [importSomas] = useMutation<ImportSomasMutationResponse, ImportSomasVariables>(IMPORT_SOMAS_MUTATION,
        {
            refetchQueries: [NEURONS_QUERY],
            onError: (error) => errorNotification("Import Failed", error),
            onCompleted: (data) => importData.importError = data.importSomas.error?.message,
        });

    const onImport = async () => {
        importData.importError = null;

        const result = await importSomas({
            variables: {
                file: importData.somaFile,
                options: {
                    specimenId: props.sample.id,
                    keywords: importData.applyKeywords ? parseKeywords(importData.keywords) : null,
                    shouldLookupSoma: importData.shouldLookupAtlasStructures,
                    defaultBrightness: importData.brightness,
                    defaultVolume: importData.volume
                }
            }
        });

        if (result.data?.importSomas.error?.message) {
            importData.importError = result.data.importSomas.error.message;
        } else if (result.errors) {
            console.log(result);
            errorNotification("Import Failed", result.errors[0]?.message);
        } else {
            successNotification("Import Successful", `${result.data.importSomas} somas imported`);
            props.onClose();
        }
    }

    return (
        <Modal.Root size="xl" centered opened={true} onClose={props.onClose}>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>{`Import Somas for Specimen ${props.sample.label}`}</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack p={12}>
                        <ImportSomasPanel importData={importData}/>
                    </Stack>

                    <Divider orientation="horizontal"/>

                    <Stack p={12}>
                        <ImportSomaFeatures importData={importData}/>
                    </Stack>

                    <Divider orientation="horizontal"/>

                    <Stack p={12}>
                        {importData.importError ? <Alert variant="filled" color="red" title="Import Failed" icon={<IconInfoCircle/>}>
                            {importData.importError}
                        </Alert> : null}
                        <Group justify="end">
                            <Button disabled={!importData.canImport} rightSection={<IconUpload size={14}/>} onClick={() => onImport()}>
                                Import
                            </Button>
                        </Group>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
});
