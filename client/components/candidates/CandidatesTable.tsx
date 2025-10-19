import * as React from "react";
import {Table} from "@mantine/core";

import {CandidateRow} from "./CandidateRow";
import {NeuronShape} from "../../models/neuron";

export interface CandidateTableProps {
    neurons: NeuronShape[];
    showAnnotators: boolean;
    totalCount: number;
    offset: number;
    limit: number;
    activePage: number;
    pageCount: number;
    selectedCandidate: NeuronShape;

    onSelected: (neuron: NeuronShape) => void;
}

export const CandidatesTable = (props: CandidateTableProps) => {
    const rows = props.neurons.map((t: NeuronShape) => {
        return <CandidateRow key={`tt_${t.id}`} neuron={t} isSelected={t.id == props.selectedCandidate?.id} showAnnotators={props.showAnnotators}
                             onSelected={props.onSelected}/>
    });

    return (
        <Table withColumnBorders>
            <Table.Thead bg="table-header">
                <Table.Tr>
                    <Table.Th rowSpan={2}>Neuron</Table.Th>
                    <Table.Th rowSpan={2}>Specimen</Table.Th>
                    <Table.Th rowSpan={2}>Keywords</Table.Th>
                    <Table.Th colSpan={4} ta="center">Atlas Soma</Table.Th>
                    <Table.Th rowSpan={2} colSpan={1} ta="center">Specimen Soma (X, Y, Z)</Table.Th>
                    {props.showAnnotators ? <Table.Th rowSpan={2}>Annotator(s)</Table.Th> : null}
                </Table.Tr>
                <Table.Tr>
                    <Table.Th>Structure</Table.Th>
                    <Table.Th ta="center">X</Table.Th>
                    <Table.Th ta="center">Y</Table.Th>
                    <Table.Th ta="center">Z</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody bg="table">
                {rows}
            </Table.Tbody>
        </Table>
    )
};
