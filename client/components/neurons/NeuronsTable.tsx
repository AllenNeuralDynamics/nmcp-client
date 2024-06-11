import * as React from "react";
import {Table} from "semantic-ui-react";
import { useQuery} from "@apollo/react-hooks";

import {INeuron} from "../../models/neuron";
import {NeuronRow} from "./NeuronRow";
import {NEURON_TRACING_COUNT_QUERY, NeuronTracingCountResponse, NeuronTracingCountVariables} from "../../graphql/neuron";

interface INeuronTableProps {
    neurons: INeuron[];
    activePage: number;
    pageCount: number;

    onDeleteNeuron(neuron: INeuron): void;
    onManageNeuronAnnotations(neuron: INeuron): void;
}

export const NeuronsTable = (props: INeuronTableProps) => {
    const {loading, error, data} = useQuery<NeuronTracingCountResponse, NeuronTracingCountVariables>(NEURON_TRACING_COUNT_QUERY,
        {
            pollInterval: 30000,
            skip: props.neurons.length == 0,
            variables: {ids: props.neurons.map(n => n.id)}
        });

    const counts = new Map<string, number>();

    if (!error && data && data.reconstructionCountsForNeurons) {
        data.reconstructionCountsForNeurons.counts.map(c => counts.set(c.id, c.count));
    }

    const rows = props.neurons.map(n => {
        return <NeuronRow key={n.id} neuron={n} tracingCount={counts.get(n.id)} onDeleteNeuron={props.onDeleteNeuron} onManageNeuronAnnotations={props.onManageNeuronAnnotations}/>
    });

    return (
        <Table attached="bottom" compact="very" style={{borderBottom: "none", borderTop: "none"}}>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Id</Table.HeaderCell>
                    <Table.HeaderCell>Tag</Table.HeaderCell>
                    <Table.HeaderCell>Sample</Table.HeaderCell>
                    <Table.HeaderCell>Soma Brain Area</Table.HeaderCell>
                    <Table.HeaderCell>Soma Sample Location</Table.HeaderCell>
                    <Table.HeaderCell>Visibility</Table.HeaderCell>
                    <Table.HeaderCell>Consensus</Table.HeaderCell>
                    <Table.HeaderCell>DOI</Table.HeaderCell>
                    <Table.HeaderCell>Reconstructions</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {rows}
            </Table.Body>
        </Table>
    );
}
