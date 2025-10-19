import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Modal, Alert, Stack, Select, Textarea, Group, Button} from '@mantine/core';
import {IconInfoCircle} from "@tabler/icons-react";

import {ImportSomasPanel} from "./ImportSomasPanel";
import {IMPORT_SOMAS_MUTATION, ImportSomasMutationResponse, ImportSomasVariables, NEURONS_QUERY} from "../../../graphql/neuron";
import {errorNotification, successNotification} from "../../common/NotificationHelper";
import {SpecimenShape} from "../../../models/specimen";

type ImportSomasModalProps = {
    sample: SpecimenShape;
    onClose: () => void;
}

export type SomaImportOptions = {
    file: File | null;
    keywords: string[];
    shouldLookupSoma: boolean;
}

export const ImportSomasModal = (props: ImportSomasModalProps) => {
    const [importError, setImportError] = useState<string | null>(null);

    const [importSomas] = useMutation<ImportSomasMutationResponse, ImportSomasVariables>(IMPORT_SOMAS_MUTATION,
        {
            refetchQueries: [NEURONS_QUERY],
            onError: (error) => errorNotification("Import Failed", error),
            onCompleted: (data) => setImportError(data.importSomas.error?.message),
        });

    const onImport = async (options: SomaImportOptions) => {
        setImportError(null);

        const result = await importSomas({
            variables: {
                file: options.file,
                options: {
                    specimenId: props.sample.id,
                    keywords: options.keywords,
                    shouldLookupSoma: options.shouldLookupSoma,
                    noEmit: false
                }
            }
        });

        if (result.data.importSomas.error?.message) {
            setImportError(result.data.importSomas.error.message);
        } else {
            successNotification("Import Successful", `${result.data.importSomas.count} somas imported`);
            props.onClose();
        }
    }


    return (
        <Modal.Root size="lg" centered opened={true} onClose={props.onClose}>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>{`Import Somas for Specimen ${props.sample.label}`}</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack m={0} p={12}>
                        <ImportSomasPanel onImport={onImport}/>
                        {importError ? <Alert variant="filled" color="red" title="Import Failed" icon={<IconInfoCircle/>}>
                            {importError}
                        </Alert> : null}
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
}
