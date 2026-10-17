import * as React from "react";
import {useState} from "react";
import {Link} from "react-router-dom";
import {useMutation} from "@apollo/client";
import {Badge, Button, Group, Stack, Table, Text} from "@mantine/core";
import {IconShare3, IconTrash} from "@tabler/icons-react";

import {useConstants} from "../../hooks/useConstants";
import {
    formatHortaLocation,
    formatKeywords,
    formatSomaLocation,
    NeuronMetadata,
    NeuronMetadataFields,
    NeuronShape,
    parseKeywords,
    parseSomaLocation
} from "../../models/neuron";
import {AtlasStructureShape} from "../../models/atlasStructure";
import {toastUpdateError, toastUpdateSuccess} from "../common/NotificationHelper";
import {UPDATE_NEURON_MUTATION, UpdateNeuronMutationResponse, UpdateNeuronVariables} from "../../graphql/neuron";
import {InputPopup} from "../common/InputPopup";
import {AtlasStructureSelect} from "../common/AtlasStructureSelect";
import {NeuronMetadataModal} from "./NeuronMetadataModal";

type NeuronRowProps = {
    neuron: NeuronShape;

    onDelete(neuron: NeuronShape): void;
}

export const NeuronRow = (props: NeuronRowProps) => {
    const constants = useConstants();

    const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);

    const [updateNeuron] = useMutation<UpdateNeuronMutationResponse, UpdateNeuronVariables>(UPDATE_NEURON_MUTATION,
        {
            onCompleted: (data) => onNeuronUpdated(data.updateNeuron),
            onError: (error) => toastUpdateError(error)
        });

    const updateLabel = async (value: string) => {
        if (value !== props.neuron.label) {
            await updateNeuron({
                variables: {neuron: {id: props.neuron.id, label: value}},
                optimisticResponse: {
                    updateNeuron: {
                        ...props.neuron,
                        id: props.neuron.id,
                        __typename: "Neuron",
                        label: value
                    },
                }
            });
        }
    }

    const updateKeywords = async (value: string) => {
        const parsed = parseKeywords(value);
        // Compare the formatted forms rather than the arrays, which are never reference-equal.  This also
        // ignores whitespace the user typed around separators, since that does not survive parsing.
        if (formatKeywords(parsed) !== formatKeywords(props.neuron.keywords)) {
            await updateNeuron({
                variables: {neuron: {id: props.neuron.id, keywords: parsed}},
                optimisticResponse: {
                    updateNeuron: {
                        ...props.neuron,
                        id: props.neuron.id,
                        __typename: "Neuron",
                        keywords: parsed
                    },
                }
            });
        }
    }

    const updateAtlasSoma = async (value: string) => {
        const result = parseSomaLocation(value);

        if (result.error || (result.x == props.neuron.atlasSoma.x && result.y == props.neuron.atlasSoma.y && result.z == props.neuron.atlasSoma.z)) {
            return;
        }

        await updateNeuron({
            variables: {neuron: {id: props.neuron.id, atlasSoma: {x: result.x, y: result.y, z: result.z}}},
            optimisticResponse: {
                updateNeuron: {
                    ...props.neuron,
                    id: props.neuron.id,
                    __typename: "Neuron",
                    atlasSoma: {x: result.x, y: result.y, z: result.z}
                },
            }
        });
    }

    const updateSampleSoma = async (value: string) => {
        const result = parseSomaLocation(value);

        if (result.error || (result.x == props.neuron.specimenSoma.x && result.y == props.neuron.specimenSoma.y && result.z == props.neuron.specimenSoma.z)) {
            return;
        }

        await updateNeuron({
            variables: {neuron: {id: props.neuron.id, specimenSoma: {x: result.x, y: result.y, z: result.z}}},
            optimisticResponse: {
                updateNeuron: {
                    ...props.neuron,
                    id: props.neuron.id,
                    __typename: "Neuron",
                    specimenSoma: {x: result.x, y: result.y, z: result.z}
                }
            }
        });
    }

    const updateAtlasStructure = async (structure: AtlasStructureShape) => {
        if (structure?.id == props.neuron.atlasStructure?.id) {
            return;
        }

        if (structure) {
            if (!props.neuron.atlasStructure || structure.id !== props.neuron.atlasStructure.id) {
                await updateNeuron({
                    variables: {neuron: {id: props.neuron.id, atlasStructureId: structure.id}},
                    optimisticResponse: {
                        updateNeuron: {
                            ...props.neuron,
                            id: props.neuron.id,
                            __typename: "Neuron",
                            atlasStructureId: structure.id,
                            atlasStructure: structure,
                        },
                    }
                });
            }
        } else {
            if (props.neuron.atlasStructure) {
                await updateNeuron({
                    variables: {neuron: {id: props.neuron.id, atlasStructureId: null}},
                    optimisticResponse: {
                        updateNeuron: {
                            ...props.neuron,
                            id: props.neuron.id,
                            __typename: "Neuron",
                            atlasStructureId: null,
                            atlasStructure: null,
                        },
                    }
                });
            }
        }
    }

    if (!props.neuron) {
        return null;
    }

    const isPublished = props.neuron.published != null;

    const hasMetadata = NeuronMetadataFields.some(f => isMetadataValueSet(props.neuron.metadata?.[f.key]));

    if (isPublished) {
        return (
            <Table.Tr key={props.neuron.id}>
                <Table.Td style={{minWidth: "60px", maxWidth: "60px"}}>
                    <Group align="center" gap="sm">
                        <Text size="sm" c="dimmed">{props.neuron.label}</Text>
                        <Link to={`/neuron/${props.neuron.id}`}><IconShare3 style={{marginTop: "4px"}} size={18}/></Link>
                    </Group>
                </Table.Td>
                <Table.Td style={{maxWidth: "100px"}}>
                    <Text size="sm" c="dimmed">{props.neuron.specimen.label}</Text>
                </Table.Td>
                <Table.Td style={{minWidth: "60px", maxWidth: "60px"}}>
                    <Text size="sm" c="dimmed">{formatKeywords(props.neuron.keywords)}</Text>
                </Table.Td>
                <Table.Td>
                    {hasMetadata ? MetadataDisplay(props.neuron.metadata, true) : <Text size="sm" c="dimmed">(none)</Text>}
                </Table.Td>
                <Table.Td style={{maxWidth: "140px"}}>
                    <Text size="sm" c="dimmed">{formatHortaLocation(props.neuron)}</Text>
                </Table.Td>
                <Table.Td style={{maxWidth: "140px"}}>
                    <Text size="sm" c="dimmed">{formatSomaLocation(props.neuron)}</Text>
                </Table.Td>
                <Table.Td>
                    <Text size="sm" c="dimmed">{props.neuron.atlasStructure ? constants.findAtlasStructure(props.neuron.atlasStructure.id)?.name : "(none)"}</Text>
                </Table.Td>
                <Table.Td style={{width: "180px"}}>
                    <Badge p={8} color="green" variant="light">
                        Published
                    </Badge>
                </Table.Td>
            </Table.Tr>
        );

    } else {
        return (
            <Table.Tr key={props.neuron.id}>
                <Table.Td style={{minWidth: "60px", maxWidth: "60px"}}>
                    <Group align="center" gap="sm">
                        <InputPopup value={props.neuron.label} placeholder="(none)" onAccept={updateLabel}/>
                        <Link to={`/neuron/${props.neuron.id}`}><IconShare3 style={{marginTop: "4px"}} size={18}/></Link>
                    </Group>
                </Table.Td>
                <Table.Td style={{maxWidth: "100px"}}>
                    {props.neuron.specimen.label}
                </Table.Td>
                <Table.Td style={{minWidth: "60px", maxWidth: "60px"}}>
                    <InputPopup value={formatKeywords(props.neuron.keywords)} placeholder="(none)" onAccept={updateKeywords}/>
                </Table.Td>
                <Table.Td>
                    {hasMetadata
                        ? <a style={{cursor: "pointer"}} onClick={() => setIsMetadataModalOpen(true)}>{MetadataDisplay(props.neuron.metadata, false)}</a>
                        : <Text size="sm" c="dimmed" style={{cursor: "pointer"}} onClick={() => setIsMetadataModalOpen(true)}>click to edit</Text>}
                    <NeuronMetadataModal neuron={props.neuron} opened={isMetadataModalOpen} onClose={() => setIsMetadataModalOpen(false)}/>
                </Table.Td>
                <Table.Td style={{maxWidth: "140px"}}>
                    <InputPopup value={formatHortaLocation(props.neuron)} placeholder="(undefined)" onAccept={updateSampleSoma}
                                isValidValueFcn={v => !parseSomaLocation(v).error}/>
                </Table.Td>
                <Table.Td style={{maxWidth: "140px"}}>
                    <InputPopup value={formatSomaLocation(props.neuron)} placeholder="(undefined)" onAccept={updateAtlasSoma}
                                isValidValueFcn={v => !parseSomaLocation(v).error}/>
                </Table.Td>
                <Table.Td>
                    <AtlasStructureSelect atlasId={props.neuron.specimen.atlasId} value={props.neuron.atlasStructure ? constants.findAtlasStructure(props.neuron.atlasStructure.id) : null} clearable={true}
                                          onChange={(s) => setTimeout(() => updateAtlasStructure(s), 200)}/>
                </Table.Td>
                <Table.Td style={{width: "180px"}}>
                    {props.neuron.reconstructionCount == 0 ?
                        <Button leftSection={<IconTrash size={18}/>} variant="light" color="red" children="remove"
                                onClick={() => props.onDelete(props.neuron)}/> :
                        <Badge p={8} variant="light">
                            {`${props.neuron.reconstructionCount} reconstruction${props.neuron.reconstructionCount != 1 ? "s" : ""}`}
                        </Badge>
                    }
                </Table.Td>
            </Table.Tr>
        );
    }
}

function isMetadataValueSet(value: number | string | null | undefined): boolean {
    return value != null && value !== "";
}

function MetadataDisplay(metadata: NeuronMetadata, isDimmed: boolean) {
    const rows = NeuronMetadataFields
        .filter(f => isMetadataValueSet(metadata?.[f.key]))
        .slice(0, 2)
        .map(f => (
            <Group key={f.key} gap="sm" wrap="nowrap">
                <Text size="sm" miw={80} c="dimmed">{f.label}</Text>
                <Text size="sm" c={isDimmed ? "dimmed" : undefined}>{metadata[f.key]}</Text>
            </Group>
        ));

    return <Stack gap={0}>{rows}</Stack>;
}

function onNeuronUpdated(data: NeuronShape) {
    if (!data) {
        toastUpdateError("The neuron was not updated.");
    } else {
        toastUpdateSuccess("The neuron was updated.");
    }
}
