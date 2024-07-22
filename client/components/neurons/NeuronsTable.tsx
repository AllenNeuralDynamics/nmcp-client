import * as React from "react";
import {Table} from "semantic-ui-react";

import {INeuron} from "../../models/neuron";
import {NeuronRow} from "./NeuronRow";

interface INeuronTableProps {
    neurons: INeuron[];
    activePage: number;
    pageCount: number;
    start: number;
    end: number;
    totalCount: number;

    onDeleteNeuron(neuron: INeuron): void;
    onManageNeuronAnnotations(neuron: INeuron): void;
}

export const NeuronsTable = (props: INeuronTableProps) => {
    const rows = props.neurons.map(n => {
        return <NeuronRow key={n.id} neuron={n} onDeleteNeuron={props.onDeleteNeuron} onManageNeuronAnnotations={props.onManageNeuronAnnotations}/>
    });

    return (
        <Table attached compact="very" size="small" style={{borderBottom: "none", borderTop: "none"}}>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Id</Table.HeaderCell>
                    <Table.HeaderCell>Sample</Table.HeaderCell>
                    <Table.HeaderCell>Tag</Table.HeaderCell>
                    <Table.HeaderCell>Soma Brain Area</Table.HeaderCell>
                    <Table.HeaderCell>Soma Location</Table.HeaderCell>
                    <Table.HeaderCell>Consensus</Table.HeaderCell>
                    <Table.HeaderCell>DOI</Table.HeaderCell>
                    <Table.HeaderCell>Reconstructions</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {rows}
            </Table.Body>
            <Table.Footer fullWidth>
                <Table.Row>
                    <Table.HeaderCell colSpan={3}>
                        {props.totalCount >= 0 ? (props.totalCount > 0 ? `Showing ${props.start} to ${props.end} of ${props.totalCount} neurons` : "There are no neurons") : ""}
                    </Table.HeaderCell>
                    <Table.HeaderCell colSpan={3} textAlign="center">
                        <i>Click a value to edit.</i>
                    </Table.HeaderCell>
                    <Table.HeaderCell colSpan={3} textAlign="right">
                        {`Page ${props.activePage} of ${props.pageCount}`}
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
}
