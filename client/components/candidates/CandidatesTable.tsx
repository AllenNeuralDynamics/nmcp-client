import * as React from "react";

import {Table} from "semantic-ui-react";
import {CandidateTracingRow} from "./CandidateTracingRow";
import {INeuron} from "../../models/neuron";

export interface ITracingsTableProps {
    neurons: INeuron[];
    totalCount: number;
    offset: number;
    limit: number;
    activePage: number;
    pageCount: number;
}

export const CandidateTracingsTable = (props: ITracingsTableProps) => {
    const rows = props.neurons.map((t: INeuron) => {
        return <CandidateTracingRow key={`tt_${t.id}`} neuron={t}/>
    });

    const start = props.offset + 1;
    const end = Math.min(props.offset + props.limit, props.totalCount);

    return (
        <div>
            <Table attached="bottom" compact="very">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Neuron</Table.HeaderCell>
                        <Table.HeaderCell>Sample</Table.HeaderCell>
                        <Table.HeaderCell>Soma Structure</Table.HeaderCell>
                        <Table.HeaderCell>Soma X</Table.HeaderCell>
                        <Table.HeaderCell>Soma Y</Table.HeaderCell>
                        <Table.HeaderCell>Soma Z</Table.HeaderCell>
                        <Table.HeaderCell>Annotator(s)</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
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
