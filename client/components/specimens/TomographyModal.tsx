import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Group, Modal, NumberInput, Stack, Text, TextInput} from "@mantine/core";

import {LinearTransformVector, SpecimenShape, TomographyRange} from "../../models/specimen";
import {SPECIMENS_QUERY, UPDATE_SPECIMEN_MUTATION, UpdateSpecimenMutationResponse, UpdateSpecimenVariables} from "../../graphql/specimen";
import {toastUpdateError, toastUpdateSuccess} from "../common/NotificationHelper";

type TomographyModalProps = {
    specimen: SpecimenShape;
    opened: boolean;
    onClose: () => void;
}

type TomographyState = {
    url: string;
    rangeMin: number | "";
    rangeMax: number | "";
    windowMin: number | "";
    windowMax: number | "";
    scaleX: number | "";
    scaleY: number | "";
    scaleZ: number | "";
    translateX: number | "";
    translateY: number | "";
    translateZ: number | "";
}

function stateFromSpecimen(specimen: SpecimenShape): TomographyState {
    const t = specimen.tomography;
    return {
        url: t?.url ?? "",
        rangeMin: t?.options?.range?.[0] ?? "",
        rangeMax: t?.options?.range?.[1] ?? "",
        windowMin: t?.options?.window?.[0] ?? "",
        windowMax: t?.options?.window?.[1] ?? "",
        scaleX: t?.linearTransform?.scale?.x ?? "",
        scaleY: t?.linearTransform?.scale?.y ?? "",
        scaleZ: t?.linearTransform?.scale?.z ?? "",
        translateX: t?.linearTransform?.translate?.x ?? "",
        translateY: t?.linearTransform?.translate?.y ?? "",
        translateZ: t?.linearTransform?.translate?.z ?? ""
    };
}

function numOrZero(v: number | ""): number {
    return v === "" ? 0 : v;
}

export const TomographyModal = ({specimen, opened, onClose}: TomographyModalProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [state, setState] = useState<TomographyState>(stateFromSpecimen(specimen));

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
            const range: TomographyRange = [numOrZero(state.rangeMin), numOrZero(state.rangeMax)];
            const window: TomographyRange = [numOrZero(state.windowMin), numOrZero(state.windowMax)];
            const scale: LinearTransformVector = {x: numOrZero(state.scaleX), y: numOrZero(state.scaleY), z: numOrZero(state.scaleZ)};
            const translate: LinearTransformVector = {x: numOrZero(state.translateX), y: numOrZero(state.translateY), z: numOrZero(state.translateZ)};

            await updateSpecimen({
                variables: {
                    specimen: {
                        id: specimen.id,
                        tomography: {
                            url: state.url,
                            options: {range, window},
                            linearTransform: {scale, translate}
                        }
                    }
                }
            });
            toastUpdateSuccess("Tomography properties updated");
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

    const update = (field: keyof TomographyState) => (v: string | number) => {
        setState({...state, [field]: v === "" ? "" : Number(v)});
    };

    const t = specimen.tomography;

    return (
        <Modal.Root opened={opened} onClose={handleClose} size="xl" centered>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>Tomography — {specimen.label}</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack m={0} p={12}>
                        {isEditing ? (
                            <>
                                <TextInput label="URL" value={state.url}
                                           onChange={(e) => setState({...state, url: e.currentTarget.value})}/>
                                <Group grow>
                                    <NumberInput label="Range Min" value={state.rangeMin} onChange={update("rangeMin")}/>
                                    <NumberInput label="Range Max" value={state.rangeMax} onChange={update("rangeMax")}/>
                                </Group>
                                <Group grow>
                                    <NumberInput label="Window Min" value={state.windowMin} onChange={update("windowMin")}/>
                                    <NumberInput label="Window Max" value={state.windowMax} onChange={update("windowMax")}/>
                                </Group>
                                <Text size="sm" fw={500}>Scale</Text>
                                <Group grow>
                                    <NumberInput label="X" value={state.scaleX} onChange={update("scaleX")}/>
                                    <NumberInput label="Y" value={state.scaleY} onChange={update("scaleY")}/>
                                    <NumberInput label="Z" value={state.scaleZ} onChange={update("scaleZ")}/>
                                </Group>
                                <Text size="sm" fw={500}>Translate</Text>
                                <Group grow>
                                    <NumberInput label="X" value={state.translateX} onChange={update("translateX")}/>
                                    <NumberInput label="Y" value={state.translateY} onChange={update("translateY")}/>
                                    <NumberInput label="Z" value={state.translateZ} onChange={update("translateZ")}/>
                                </Group>
                            </>
                        ) : (
                            <>
                                <FeatureRow label="URL" value={t?.url}/>
                                <FeatureRow label="Range" value={formatRange(t?.options?.range)}/>
                                <FeatureRow label="Window" value={formatRange(t?.options?.window)}/>
                                <FeatureRow label="Scale" value={formatVector(t?.linearTransform?.scale)}/>
                                <FeatureRow label="Translate" value={formatVector(t?.linearTransform?.translate)}/>
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

function formatRange(range?: TomographyRange): string | undefined {
    if (!range) return undefined;
    return `${range[0]} – ${range[1]}`;
}

function formatVector(v?: LinearTransformVector): string | undefined {
    if (!v) return undefined;
    return `${v.x}, ${v.y}, ${v.z}`;
}

function FeatureRow({label, value}: { label: string; value?: string }) {
    return (
        <Group gap="sm">
            <Text size="sm" fw={500} miw={140}>{label}</Text>
            <Text size="sm">{value ?? "—"}</Text>
        </Group>
    );
}
