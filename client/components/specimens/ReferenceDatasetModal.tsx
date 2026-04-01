import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Group, Modal, Stack, Text, TextInput} from "@mantine/core";

import {SpecimenShape} from "../../models/specimen";
import {SPECIMENS_QUERY, UPDATE_SPECIMEN_MUTATION, UpdateSpecimenMutationResponse, UpdateSpecimenVariables} from "../../graphql/specimen";
import {toastUpdateError, toastUpdateSuccess} from "../common/NotificationHelper";

type ReferenceDataSetModalProps = {
    specimen: SpecimenShape;
    opened: boolean;
    onClose: () => void;
}

type ReferenceDataSetState = {
    url: string;
    segmentationUrl: string;
}

function stateFromSpecimen(specimen: SpecimenShape): ReferenceDataSetState {
    return {
        url: specimen.referenceDataset?.url ?? "",
        segmentationUrl: specimen.referenceDataset?.segmentationUrl ?? ""
    };
}

export const ReferenceDatasetModal = ({specimen, opened, onClose}: ReferenceDataSetModalProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [state, setState] = useState<ReferenceDataSetState>(stateFromSpecimen(specimen));

    const [updateSpecimen, {loading}] = useMutation<UpdateSpecimenMutationResponse, UpdateSpecimenVariables>(UPDATE_SPECIMEN_MUTATION, {
        refetchQueries: [SPECIMENS_QUERY]
    });

    const resetState = () => {
        setState(stateFromSpecimen(specimen));
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
        try {
            await updateSpecimen({
                variables: {
                    specimen: {
                        id: specimen.id,
                        referenceDataset: {
                            url: state.url,
                            segmentationUrl: state.segmentationUrl
                        }
                    }
                }
            });
            toastUpdateSuccess("Reference data set updated");
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
        <Modal.Root opened={opened} onClose={handleClose} size="lg" centered>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>Reference Data Set — {specimen.label}</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack m={0} p={12}>
                        {isEditing ? (
                            <>
                                <TextInput label="URL" value={state.url}
                                           onChange={(e) => setState({...state, url: e.currentTarget.value})}/>
                                <TextInput label="Segmentation URL" value={state.segmentationUrl}
                                           onChange={(e) => setState({...state, segmentationUrl: e.currentTarget.value})}/>
                            </>
                        ) : (
                            <>
                                <Group gap="sm">
                                    <Text size="sm" fw={500} miw={140}>URL</Text>
                                    <Text size="sm">{specimen.referenceDataset?.url || "—"}</Text>
                                </Group>
                                <Group gap="sm">
                                    <Text size="sm" fw={500} miw={140}>Segmentation URL</Text>
                                    <Text size="sm">{specimen.referenceDataset?.segmentationUrl || "—"}</Text>
                                </Group>
                            </>
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
