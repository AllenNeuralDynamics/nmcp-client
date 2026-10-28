import * as React from "react";
import {Badge, Group, Skeleton, Table} from "@mantine/core";
import {IconBrowserShare} from "@tabler/icons-react";

import {BracesKind, formatHortaLocation, formatKeywords, NeuronShape} from "../../models/neuron";
import {formatAtlasStructure} from "../../models/atlasStructure";
import {ReconstructionStatus, statusColor, statusNameOnly} from "../../models/reconstructionStatus";
import {AnnotatorWithStatus} from "../common/AnnotatorWithStatus";
import {successNotification} from "../common/NotificationHelper";
import {NeuronVersionLink} from "../common/NeuronVersionLink";
import {SpecimenLink} from "../common/SpecimenLink";

// The virtual table positions rows arithmetically, so every row must render at exactly this height: single-line cells
// only.
export const CandidateRowHeight = 37;

const singleLine: React.CSSProperties = {whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"};

export function candidateColumnCount(showAnnotators: boolean): number {
    return showAnnotators ? 10 : 9;
}

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

    const soma = props.neuron.atlasSoma;

    return (
        <Table.Tr {...subProps} style={{height: CandidateRowHeight}} onClick={() => props.onSelected(props.neuron)}>
            <Table.Td style={singleLine}>
                <Group gap="xs" wrap="nowrap">
                    <NeuronVersionLink neuron={props.neuron} openAtlasTab newTabLink/>
                    {heldStatuses.map(s => <Badge key={s} size="xs" color={statusColor(s)} variant="light">{statusNameOnly(s)}</Badge>)}
                    {props.neuron.untraceable ? <Badge size="xs" color="gray" variant="light">Untraceable</Badge> : null}
                </Group>
            </Table.Td>
            <Table.Td style={singleLine}><SpecimenLink specimen={props.neuron.specimen}/></Table.Td>
            <Table.Td style={singleLine} ta={genotypeAlign}>{genotype}</Table.Td>
            <Table.Td style={singleLine}>{formatKeywords(props.neuron.keywords)}</Table.Td>
            <Table.Td style={singleLine}>{formatAtlasStructure(props.neuron.atlasStructure, "(unspecified)")}</Table.Td>
            <Table.Td style={singleLine}>{soma?.x.toFixed(1)}</Table.Td>
            <Table.Td style={singleLine}>{soma?.y.toFixed(1)}</Table.Td>
            <Table.Td style={singleLine}>{soma?.z.toFixed(1)}</Table.Td>
            <Table.Td style={singleLine}><Group gap="sm" align="center" wrap="nowrap"><IconBrowserShare size={12} onClick={async () => {
                await onCopyHorta()
            }}/>{formatHortaLocation(props.neuron)}</Group></Table.Td>
            {props.showAnnotators ?
                <Table.Td style={singleLine}>
                    <AnnotatorWithStatus reconstructions={props.neuron.reconstructions}/>
                </Table.Td>
                : null}
        </Table.Tr>
    )
}

export const CandidatePlaceholderRow = ({columnCount}: { columnCount: number }) => {
    return (
        <Table.Tr style={{height: CandidateRowHeight}} data-placeholder="true">
            <Table.Td colSpan={columnCount}>
                <Skeleton height={10} radius="sm"/>
            </Table.Td>
        </Table.Tr>
    );
}
