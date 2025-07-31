import * as React from "react";
import {useState} from "react";

import {Modal, Alert, Stack} from '@mantine/core';
import {ImportSomasPanel} from "./ImportSomasPanel";
import {useMutation} from "@apollo/client";
import {IMPORT_SOMAS_MUTATION, ImportSomasMutationResponse, ImportSomasVariables} from "../../../graphql/neuron";
import {toast} from "react-toastify";
import {IconInfoCircle} from "@tabler/icons-react";

type ImportSomasModalProps = {
    sampleId: string;
    onClose: () => void;
}

export type SomaImportOptions = {
    file: File | null;
    tag: string;
    shouldLookupSoma: boolean;
}

export const ImportSomasModal = (props: ImportSomasModalProps) => {
    const [importError, setImportError] = useState<string | null>(null);

    const [importSomas] = useMutation<ImportSomasMutationResponse, ImportSomasVariables>(IMPORT_SOMAS_MUTATION,
        {
            refetchQueries: ["NeuronsQuery"],
            onError: (error) => toast.error((
                <div><h3>Import Failed</h3>{error ? error.message : "(no additional details available)"}</div>), {autoClose: false}),
            onCompleted: (data) => setImportError(data.importSomas.error?.message),
        });

    const onCancel = () => {
        props.onClose();
    }

    const onImport = async (options: SomaImportOptions) => {
        setImportError(null);

        const result = await importSomas({
            variables: {
                file: options.file,
                options: {
                    sampleId: props.sampleId,
                    tag: options.tag,
                    shouldLookupSoma: options.shouldLookupSoma,
                    noEmit: false
                }
            }
        });

        if (result.data.importSomas.error?.message) {
            setImportError(result.data.importSomas.error.message);
        } else{
            toast.success(<div><h3>Import Successful</h3>{result.data.importSomas.count} somas imported.</div>, {autoClose: 2500});
            props.onClose();
        }
    }

    return (
        <Modal opened={true} onClose={props.onClose} title="Import Somas for Sample" centered>
            <Stack>
                <ImportSomasPanel onImport={onImport}/>
                {importError ? <Alert variant="filled" color="red" title="Import Failed" icon={<IconInfoCircle/>}>
                    {importError}
                </Alert> : null}
            </Stack>
        </Modal>
    );
}
