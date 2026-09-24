import * as React from "react";
import {Badge, Group, Table} from "@mantine/core";
import {IconBrowserShare} from "@tabler/icons-react";

import {formatHortaLocation, formatKeywords, NeuronShape} from "../../models/neuron";
import {formatAtlasStructure} from "../../models/atlasStructure";
import {AnnotatorWithStatus} from "../common/AnnotatorWithStatus";
import {successNotification} from "../common/NotificationHelper";
import {NeuronVersionLink} from "../common/NeuronVersionLink";

export interface ICandidateRowProps {
    key: string
    neuron: NeuronShape;
    showAnnotators: boolean;
    isSelected: boolean;

    onSelected: (neuron: NeuronShape) => void;
}

export const CandidateRow = (props: ICandidateRowProps) => {
    const onCopyHorta = async () => {
        await navigator.clipboard.writeText(formatHortaLocation(props.neuron));
        successNotification("Location Copied to Clipboard", formatHortaLocation(props.neuron));
    }

    const subProps = props.isSelected ? {bg: "table-selection"} : {};

    const genotypeName = props.neuron.specimen.genotype?.name;
    const [genotype, genotypeAlign]: [string, "left" | "center"] = genotypeName ? [genotypeName, "left"] : ["-", "center"];

    return (
        <Table.Tr {...subProps} onClick={() => props.onSelected(props.neuron)}>
            <Table.Td>
                <Group gap="xs" wrap="nowrap">
                    <NeuronVersionLink neuron={props.neuron} focusOnSoma/>
                    {props.neuron.untraceable ? <Badge size="xs" color="gray" variant="light">Untraceable</Badge> : null}
                </Group>
            </Table.Td>
            <Table.Td>{props.neuron.specimen.label}</Table.Td>
            <Table.Td ta={genotypeAlign}>{genotype}</Table.Td>
            <Table.Td>{formatKeywords(props.neuron.keywords)}</Table.Td>
            <Table.Td>{formatAtlasStructure(props.neuron.atlasStructure, "(unspecified)")}</Table.Td>
            <Table.Td>{props.neuron.atlasSoma.x.toFixed(1)}</Table.Td>
            <Table.Td>{props.neuron.atlasSoma.y.toFixed(1)}</Table.Td>
            <Table.Td>{props.neuron.atlasSoma.z.toFixed(1)}</Table.Td>
            <Table.Td><Group gap="sm" align="center"><IconBrowserShare size={12} onClick={async () => {
                await onCopyHorta()
            }}/>{formatHortaLocation(props.neuron)}</Group></Table.Td>
            {props.showAnnotators ?
                <Table.Td>
                    <AnnotatorWithStatus reconstructions={props.neuron.reconstructions}/>
                </Table.Td>
                : null}
        </Table.Tr>
    )
}
