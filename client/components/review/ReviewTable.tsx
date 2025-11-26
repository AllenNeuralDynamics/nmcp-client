import * as React from "react";
import {Center, Group, Table, Text, useComputedColorScheme} from "@mantine/core";
import {IconAlertTriangle} from "@tabler/icons-react";

import {formatAtlasStructure} from "../../models/atlasStructure";
import {User} from "../../models/user";
import {ReconstructionStatusLabel} from "../common/ReconstructionStatus";
import {NodeCounts, Reconstruction} from "../../models/reconstruction";
import {NeuronVersionLink} from "../common/NeuronVersionLink";
import {UseColorSchemeValue} from "@mantine/hooks";

export type ReviewTableProps = {
    reconstructions: Reconstruction[]
    totalCount: number;
    offset: number;
    limit: number;
    isFiltered: boolean;
    selected: Reconstruction;

    onRowClick(id: Reconstruction): void;
}

export const ReviewTable = (props: ReviewTableProps) => {
    const rows = props.reconstructions.map((r: Reconstruction) => {
        return <ReviewRow reconstruction={r} isSelected={r == props.selected} onRowClick={props.onRowClick}/>
    });
    return (
        <Table withColumnBorders>
            <Table.Thead bg="table-header">
                <Table.Tr>
                    <Table.Th rowSpan={3}>Neuron</Table.Th>
                    <Table.Th rowSpan={3}>Specimen</Table.Th>
                    <Table.Th rowSpan={2} colSpan={2} ta="center">Specimen-Space</Table.Th>
                    <Table.Th colSpan={6} ta="center">Atlas-Space</Table.Th>
                    <Table.Th rowSpan={3}>Annotator</Table.Th>
                    <Table.Th rowSpan={3}>Peer Reviewer</Table.Th>
                    <Table.Th rowSpan={3}>Proofreader</Table.Th>
                    <Table.Th rowSpan={3}>Status</Table.Th>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th colSpan={4} ta="center">Soma</Table.Th>
                    <Table.Th colSpan={2} ta="center">Nodes</Table.Th>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>Axon</Table.Th>
                    <Table.Th>Dendrite</Table.Th>
                    <Table.Th>Structure</Table.Th>
                    <Table.Th ta="center">X</Table.Th>
                    <Table.Th ta="center">Y</Table.Th>
                    <Table.Th ta="center">Z</Table.Th>
                    <Table.Th>Axon</Table.Th>
                    <Table.Th>Dendrite</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody bg="table">
                {rows}
            </Table.Tbody>
        </Table>
    );
}

type ReviewRowProps = {
    isSelected: boolean;
    reconstruction: Reconstruction;

    onRowClick(id: Reconstruction): void;
}

const ReviewRow = (props: ReviewRowProps) => {
    const scheme = useComputedColorScheme();

    function userNameIfAvailable(user?: User): [string, "left" | "center" | "right"] {
        return user ? [`${user.firstName} ${user.lastName}`, "left"] : ["-", "center"];
    }

    const [proof, proofAlign] = userNameIfAvailable(props.reconstruction.atlasReconstruction?.reviewer);
    const [peer, peerAlign] = userNameIfAvailable(props.reconstruction.reviewer);

    const rowProps = props.isSelected ? {bg: "table-selection"} : {};

    return (
        <Table.Tr key={props.reconstruction.id} {...rowProps} onClick={() => props.onRowClick(props.reconstruction)}>
            <Table.Td><NeuronVersionLink neuron={props.reconstruction.neuron}/></Table.Td>
            <Table.Td>{props.reconstruction.neuron.specimen.label}</Table.Td>
            {...cellsForNodeCounts(props.reconstruction.specimenNodeCounts, scheme)}
            <Table.Td><Text size="sm" lineClamp={1}>{formatAtlasStructure(props.reconstruction.neuron?.atlasStructure, "(unspecified)")}</Text></Table.Td>
            <Table.Td ta="end">{props.reconstruction.neuron.atlasSoma.x.toFixed(1)}</Table.Td>
            <Table.Td ta="end">{props.reconstruction.neuron.atlasSoma.y.toFixed(1)}</Table.Td>
            <Table.Td ta="end">{props.reconstruction.neuron.atlasSoma.z.toFixed(1)}</Table.Td>
            {...cellsForNodeCounts(props.reconstruction.atlasReconstruction.nodeCounts, scheme)}
            <Table.Td><Text size="sm" lineClamp={1}>{props.reconstruction.annotator.firstName} {props.reconstruction.annotator.lastName}</Text></Table.Td>
            <Table.Td ta={peerAlign}><Text size="sm" lineClamp={1}>{peer}</Text></Table.Td>
            <Table.Td ta={proofAlign}><Text size="sm" lineClamp={1}>{proof}</Text></Table.Td>
            <Table.Td><ReconstructionStatusLabel reconstructions={props.reconstruction}/></Table.Td>
        </Table.Tr>
    );
}

function cellsForNodeCounts(nodeCounts: NodeCounts, scheme: UseColorSchemeValue) {
    const cells = [];

    const haveNodes = nodeCounts != null;

    const cellProps = !haveNodes ? (scheme == "light" ? {bg: "warning-bg"} : {c: "warning-c"}) : {};

    if (haveNodes) {
        cells.push(<Table.Td ta="end">{nodeCounts.axon.total}</Table.Td>);
        cells.push(<Table.Td ta="end">{nodeCounts.dendrite.total}</Table.Td>);
    } else {
        cells.push(<Table.Td colSpan={2} ta="center" {...cellProps}><Center><Group gap="sm"><IconAlertTriangle size={12}/>upload</Group></Center></Table.Td>);
    }

    return cells;
}
