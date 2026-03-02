import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Group, Modal, NumberInput, Stack, Text} from "@mantine/core";

import {SpecimenShape} from "../../models/specimen";
import {SPECIMENS_QUERY, UPDATE_SPECIMEN_MUTATION, UpdateSpecimenMutationResponse, UpdateSpecimenVariables} from "../../graphql/specimen";
import {toastUpdateError, toastUpdateSuccess} from "../common/NotificationHelper";

type SomaFeaturesModalProps = {
    specimen: SpecimenShape;
    opened: boolean;
    onClose: () => void;
}

export const SomaFeaturesModal = ({specimen, opened, onClose}: SomaFeaturesModalProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [brightness, setBrightness] = useState<number | "">(specimen.somaProperties?.defaultBrightness ?? "");
    const [volume, setVolume] = useState<number | "">(specimen.somaProperties?.defaultVolume ?? "");

    const [updateSpecimen, {loading}] = useMutation<UpdateSpecimenMutationResponse, UpdateSpecimenVariables>(UPDATE_SPECIMEN_MUTATION, {
        refetchQueries: [SPECIMENS_QUERY]
    });

    const resetState = () => {
        setBrightness(specimen.somaProperties?.defaultBrightness ?? "");
        setVolume(specimen.somaProperties?.defaultVolume ?? "");
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
                        somaProperties: {
                            defaultBrightness: brightness === "" ? undefined : brightness,
                            defaultVolume: volume === "" ? undefined : volume
                        }
                    }
                }
            });
            toastUpdateSuccess("Soma features updated");
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
                    <Modal.Title>Soma Features — {specimen.label}</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack m={0} p={12}>
                        {isEditing ? (
                            <>
                                <NumberInput label="Default Brightness" value={brightness}
                                             onChange={(v) => setBrightness(v === "" ? "" : Number(v))}/>
                                <NumberInput label="Default Volume" value={volume}
                                             onChange={(v) => setVolume(v === "" ? "" : Number(v))}/>
                            </>
                        ) : (
                            <>
                                <FeatureRow label="Default Brightness" value={specimen.somaProperties?.defaultBrightness}/>
                                <FeatureRow label="Default Volume" value={specimen.somaProperties?.defaultVolume}/>
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

function FeatureRow({label, value}: { label: string; value?: number }) {
    return (
        <Group gap="sm">
            <Text size="sm" fw={500} miw={140}>{label}</Text>
            <Text size="sm">{value != null ? value : "—"}</Text>
        </Group>
    );
}
