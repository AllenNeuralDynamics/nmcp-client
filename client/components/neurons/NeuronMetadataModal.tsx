import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Group, Modal, NumberInput, Stack, Text, TextInput} from "@mantine/core";

import {formatNeuron, NeuronMetadata, NeuronMetadataFields, NeuronShape} from "../../models/neuron";
import {UPDATE_NEURON_MUTATION, UpdateNeuronMutationResponse, UpdateNeuronVariables} from "../../graphql/neuron";
import {toastUpdateError, toastUpdateSuccess} from "../common/NotificationHelper";

type NeuronMetadataModalProps = {
    neuron: NeuronShape;
    opened: boolean;
    onClose: () => void;
}

export const NeuronMetadataModal = ({neuron, opened, onClose}: NeuronMetadataModalProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [instance, setInstance] = useState<number | "">(neuron.metadata?.instance ?? "");
    const [priority, setPriority] = useState<number | "">(neuron.metadata?.priority ?? "");
    const [somaGroup, setSomaGroup] = useState<string>(neuron.metadata?.somaGroup ?? "");

    const [updateNeuron, {loading}] = useMutation<UpdateNeuronMutationResponse, UpdateNeuronVariables>(UPDATE_NEURON_MUTATION);

    const resetState = () => {
        setInstance(neuron.metadata?.instance ?? "");
        setPriority(neuron.metadata?.priority ?? "");
        setSomaGroup(neuron.metadata?.somaGroup ?? "");
    };

    const onEdit = () => {
        resetState();
        setIsEditing(true);
    };

    const onCancel = () => {
        resetState();
        setIsEditing(false);
    };

    const onSave = async () => {
        // The API merges metadata into the stored value, so a cleared field has to be sent as null rather than left
        // out, and an entirely empty object as null to clear it.
        const metadata: NeuronMetadata = {
            instance: instance === "" ? null : instance,
            priority: priority === "" ? null : priority,
            somaGroup: somaGroup.trim() || null
        };

        const isEmpty = Object.values(metadata).every(v => v === null);

        try {
            await updateNeuron({variables: {neuron: {id: neuron.id, metadata: isEmpty ? null : metadata}}});
            toastUpdateSuccess("Neuron metadata updated");
            setIsEditing(false);
        } catch (error) {
            toastUpdateError(error instanceof Error ? error : String(error));
        }
    };

    const handleClose = () => {
        setIsEditing(false);
        resetState();
        onClose();
    };

    return (
        <Modal.Root opened={opened} onClose={handleClose} size="md" centered>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>Metadata — {formatNeuron(neuron)}</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack m={0} p={12}>
                        {isEditing ? (
                            <>
                                <NumberInput label="Instance" value={instance} allowDecimal={false}
                                             onChange={(v) => setInstance(v === "" ? "" : Number(v))}/>
                                <NumberInput label="Priority" value={priority} allowDecimal={false}
                                             onChange={(v) => setPriority(v === "" ? "" : Number(v))}/>
                                <TextInput label="Soma Group" value={somaGroup}
                                           onChange={(e) => setSomaGroup(e.currentTarget.value)}/>
                            </>
                        ) : (
                            NeuronMetadataFields.map(f => <MetadataRow key={f.key} label={f.label} value={neuron.metadata?.[f.key]}/>)
                        )}
                        <Group justify="flex-end">
                            {isEditing ? (
                                <>
                                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                                    <Button variant="light" loading={loading} onClick={onSave}>Save</Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="light" onClick={onEdit}>Edit</Button>
                                    <Button variant="outline" onClick={handleClose}>Close</Button>
                                </>
                            )}
                        </Group>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};

function MetadataRow({label, value}: { label: string; value?: number | string }) {
    return (
        <Group gap="sm">
            <Text size="sm" fw={500} miw={140}>{label}</Text>
            <Text size="sm">{value != null && value !== "" ? value : "—"}</Text>
        </Group>
    );
}
