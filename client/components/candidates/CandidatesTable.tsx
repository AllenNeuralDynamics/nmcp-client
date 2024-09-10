import * as React from "react";

import {Table} from "semantic-ui-react";
import {CandidateNeuronRow} from "./CandidateNeuronRow";
import {INeuron} from "../../models/neuron";

export interface ITracingsTableProps {
    neurons: INeuron[];
    showAnnotators: boolean;
    totalCount: number;
    offset: number;
    limit: number;
    activePage: number;
    pageCount: number;
    selectedCandidate: INeuron;

    onSelected: (neuron: INeuron) => void;
}

export const CandidateTracingsTable = (props: ITracingsTableProps) => {
    const rows = props.neurons.map((t: INeuron) => {
        return <CandidateNeuronRow key={`tt_${t.id}`} neuron={t} isSelected={t.id == props.selectedCandidate?.id} showAnnotators={props.showAnnotators}
                                   onSelected={props.onSelected}/>
    });

    const start = props.offset + 1;
    const end = Math.min(props.offset + props.limit, props.totalCount);

    return (
        <div>
            <Table attached="bottom" compact="very" size="small" structured celled selectable>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell rowSpan={2}>Neuron</Table.HeaderCell>
                        <Table.HeaderCell rowSpan={2}>Subject</Table.HeaderCell>
                        <Table.HeaderCell colSpan={4} textAlign="center">Soma</Table.HeaderCell>
                        {props.showAnnotators ? <Table.HeaderCell rowSpan={2}>Annotator(s)</Table.HeaderCell> : null}
                    </Table.Row>
                    <Table.Row>
                        <Table.HeaderCell>Structure</Table.HeaderCell>
                        <Table.HeaderCell>X</Table.HeaderCell>
                        <Table.HeaderCell>Y</Table.HeaderCell>
                        <Table.HeaderCell>Z</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {rows}
                </Table.Body>
                <Table.Footer fullwidth="true">
                    <Table.Row>
                        <Table.HeaderCell colSpan={5}>
                            {props.totalCount >= 0 ? (props.totalCount > 0 ? `Showing ${start} to ${end} of ${props.totalCount} candidate neurons` : "There are no candidate neurons") : ""}
                        </Table.HeaderCell>
                        <Table.HeaderCell colSpan={6} textAlign="right">
                            {`Page ${props.activePage} of ${props.pageCount}`}
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>
        </div>
    )
};
