import * as React from "react";
import {Table} from "@mantine/core";

import {NeuronShape} from "../../models/neuron";
import {NeuronRow} from "./NeuronRow";

type NeuronTableProps = {
    neurons: NeuronShape[];
    activePage: number;
    pageCount: number;
    start: number;
    end: number;
    totalCount: number;

    onDeleteNeuron(neuron: NeuronShape): void;
}

export const NeuronsTable = (props: NeuronTableProps) => {
    const rows = props.neurons.map(n => {
        return <NeuronRow key={n.id} neuron={n} onDelete={props.onDeleteNeuron}/>
    });

    return (
        <Table>
            <Table.Thead bg="table-header">
                <Table.Tr>
                    <Table.Th>Id</Table.Th>
                    <Table.Th>Specimen</Table.Th>
                    <Table.Th>Keywords</Table.Th>
                    <Table.Th>Specimen Soma</Table.Th>
                    <Table.Th>Atlas Soma</Table.Th>
                    <Table.Th>Atlas Soma Structure</Table.Th>
                    <Table.Th/>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody bg="table">
                {rows}
            </Table.Tbody>
        </Table>
    );
}
