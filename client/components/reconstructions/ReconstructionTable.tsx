import * as React from "react";
import {Link} from "react-router-dom";
import {Table} from "@mantine/core";

import {Reconstruction} from "../../models/reconstruction";
import {formatNeuron} from "../../models/neuron";
import {formatAtlasStructure} from "../../models/atlasStructure";
import {formatUser} from "../../models/user";
import {ReconstructionStatusLabel} from "../common/ReconstructionStatus";
import {NeuronVersionLink} from "../common/NeuronVersionLink";

type ReconstructionTableProps = {
    reconstructions: Reconstruction[];
    selectedId: string;

    onSelected: (reconstruction: Reconstruction) => void;
}
export const ReconstructionTable = ({reconstructions, selectedId, onSelected}: ReconstructionTableProps) => {
    const rows = reconstructions.map(r => {
        return <ReconstructionRow reconstruction={r} isSelected={r.id == selectedId} onSelected={onSelected}/>
    });

    return (
        <Table withColumnBorders>
            <Table.Thead bg="table-header">
                <Table.Tr>
                    <Table.Th rowSpan={2}>Neuron</Table.Th>
                    <Table.Th rowSpan={2}>Specimen</Table.Th>
                    <Table.Th colSpan={4} ta="center">Soma</Table.Th>
                    <Table.Th colSpan={2} ta="center">Node Count</Table.Th>
                    <Table.Th rowSpan={2}>Annotator</Table.Th>
                    <Table.Th rowSpan={2}>Status</Table.Th>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>Structure</Table.Th>
                    <Table.Th>X</Table.Th>
                    <Table.Th>Y</Table.Th>
                    <Table.Th>Z</Table.Th>
                    <Table.Th>Axon</Table.Th>
                    <Table.Th>Dendrite</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody bg="table">
                {rows}
            </Table.Tbody>
        </Table>
    );
};

type ReconstructionRowProps = {
    reconstruction: Reconstruction;
    isSelected: boolean;

    onSelected: (reconstruction: Reconstruction) => void;
}

export const ReconstructionRow = (props: ReconstructionRowProps) => {
    const subProps = props.isSelected ? {bg: "table-selection"} : {};

    const nodeCounts = props.reconstruction.atlasReconstruction.nodeCounts ?? props.reconstruction.specimenNodeCounts;

    return (
        <Table.Tr key={props.reconstruction.id} {...subProps} onClick={() => props.onSelected(props.reconstruction)}>
            <Table.Td><NeuronVersionLink neuron={props.reconstruction.neuron}/></Table.Td>
            <Table.Td>{props.reconstruction.neuron.specimen.label}</Table.Td>
            <Table.Td>{formatAtlasStructure(props.reconstruction.neuron.atlasStructure, "(unspecified)")}</Table.Td>
            <Table.Td>{props.reconstruction.neuron.atlasSoma?.x.toFixed(1)}</Table.Td>
            <Table.Td>{props.reconstruction.neuron.atlasSoma?.y.toFixed(1)}</Table.Td>
            <Table.Td>{props.reconstruction.neuron.atlasSoma?.z.toFixed(1)}</Table.Td>
            <Table.Td>{nodeCounts?.axon?.total ?? "N/A"}</Table.Td>
            <Table.Td>{nodeCounts?.dendrite?.total ?? "N/A"}</Table.Td>
            <Table.Td>{formatUser(props.reconstruction.annotator)}</Table.Td>
            <Table.Td><ReconstructionStatusLabel reconstructions={props.reconstruction}/> </Table.Td>
        </Table.Tr>
    );
}
