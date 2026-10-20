import * as React from "react";
import {Badge, Group, Table} from "@mantine/core";
import {IconBrowserShare} from "@tabler/icons-react";

import {BracesKind, formatHortaLocation, formatKeywords, NeuronShape} from "../../models/neuron";
import {formatAtlasStructure} from "../../models/atlasStructure";
import {ReconstructionStatus, statusColor, statusNameOnly} from "../../models/reconstructionStatus";
import {AnnotatorWithStatus} from "../common/AnnotatorWithStatus";
import {successNotification} from "../common/NotificationHelper";
import {NeuronVersionLink} from "../common/NeuronVersionLink";
import {SpecimenLink} from "../common/SpecimenLink";

export interface ICandidateRowProps {
    key: string
    neuron: NeuronShape;
    showAnnotators: boolean;
    isSelected: boolean;

    onSelected: (neuron: NeuronShape) => void;
}

export const CandidateRow = (props: ICandidateRowProps) => {
    const onCopyHorta = async () => {
        const coords = formatHortaLocation(props.neuron, BracesKind.Bracket);
        await navigator.clipboard.writeText(coords);
        successNotification("Location Copied to Clipboard", coords);
    }

    const subProps = props.isSelected ? {bg: "table-selection"} : {};

    const genotypeName = props.neuron.specimen.genotype?.name;
    const [genotype, genotypeAlign]: [string, "left" | "center"] = genotypeName ? [genotypeName, "left"] : ["-", "center"];

    // Unlike Untraceable, these rows are not soft-deleted, so they arrive with the neuron's reconstructions rather than
    // as a neuron-level flag.
    const heldStatuses = [ReconstructionStatus.Duplicate, ReconstructionStatus.Incomplete].filter(s => props.neuron.reconstructions?.some(r => r?.status == s));

    return (
        <Table.Tr {...subProps} onClick={() => props.onSelected(props.neuron)}>
            <Table.Td>
                <Group gap="xs" wrap="nowrap">
                    <NeuronVersionLink neuron={props.neuron} openAtlasTab/>
                    {heldStatuses.map(s => <Badge key={s} size="xs" color={statusColor(s)} variant="light">{statusNameOnly(s)}</Badge>)}
                    {props.neuron.untraceable ? <Badge size="xs" color="gray" variant="light">Untraceable</Badge> : null}
                </Group>
            </Table.Td>
            <Table.Td><SpecimenLink specimen={props.neuron.specimen}/></Table.Td>
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
