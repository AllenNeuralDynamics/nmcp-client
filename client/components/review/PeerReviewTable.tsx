import * as React from "react";
import {useMutation} from "@apollo/client";
import {Button, Label, Table, TableCell, TableRow} from "semantic-ui-react";

import {
    APPROVE_RECONSTRUCTION_PEER_REVIEW_MUTATION,
    ApproveReconstructionPeerReviewResponse,
    ApproveReconstructionPeerReviewVariables,
    DECLINE_ANNOTATION_MUTATION,
    DeclineAnnotationResponse,
    DeclineAnnotationVariables
} from "../../graphql/reconstruction";
import {IReconstruction} from "../../models/reconstruction";
import {displayNeuron} from "../../models/neuron";
import {displayBrainArea} from "../../models/brainArea";
import {reconstructionStatusColor, reconstructionStatusString} from "../../models/reconstructionStatus";

export type ReviewTableProps = {
    reconstructions: IReconstruction[]
    totalCount: number;
    offset: number;
    limit: number;
    isFiltered: boolean;
}

export const PeerReviewTable = (props: ReviewTableProps) => {
    const rows = props.reconstructions.map((r: IReconstruction) => {
        return <PeerReviewRow key={`tt_${r.id}`} reconstruction={r}/>
    });

    let totalMessage = "There are no reconstructions awaiting peer review";

    if (props.totalCount > 0) {
        if (props.totalCount > 1) {
            totalMessage = `There are ${props.totalCount} reconstructions awaiting peer review`
        } else {
            totalMessage = `There is 1 reconstruction awaiting peer review`
        }
    }

    if (props.isFiltered) {
        totalMessage += " that meet the filter setting"
    }

    const pageCount = Math.max(Math.ceil(props.totalCount / props.limit), 1);

    const activePage = props.offset ? (Math.floor(props.offset / props.limit) + 1) : 1;

    return (
        <Table attached="bottom" compact="very" size="small" celled structured selectable>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell rowSpan={2}>Neuron</Table.HeaderCell>
                    <Table.HeaderCell rowSpan={2}>Subject</Table.HeaderCell>
                    <Table.HeaderCell colSpan={4} textAlign="center">Soma</Table.HeaderCell>
                    <Table.HeaderCell rowSpan={2}>Annotator</Table.HeaderCell>
                    <Table.HeaderCell rowSpan={2}>Status</Table.HeaderCell>
                    <Table.HeaderCell rowSpan={2}>Actions</Table.HeaderCell>
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
                    <Table.HeaderCell colSpan={7}>
                        {totalMessage}
                    </Table.HeaderCell>
                    <Table.HeaderCell colSpan={7} textAlign="right">
                        {`Page ${activePage} of ${pageCount}`}
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
}

type PeerReviewRowProps = {
    reconstruction: IReconstruction;
}

const PeerReviewRow = (props: PeerReviewRowProps) => {
    const [approvePeerReview, {data: approveData}] = useMutation<ApproveReconstructionPeerReviewResponse, ApproveReconstructionPeerReviewVariables>(APPROVE_RECONSTRUCTION_PEER_REVIEW_MUTATION,
        {
            refetchQueries: ["ReviewableReconstructions", "CandidatesForReview"]
        });

    const [declineAnnotation, {data: declineData}] = useMutation<DeclineAnnotationResponse, DeclineAnnotationVariables>(DECLINE_ANNOTATION_MUTATION,
        {
            refetchQueries: ["ReviewableReconstructions"]
        });

    const approveButton = (
        <Button icon="check" size="mini" color="violet" content="Request Publish Review"
                onClick={() => approvePeerReview({variables: {id: props.reconstruction.id}})}/>);

    return (
        <TableRow>
            <TableCell>{displayNeuron(props.reconstruction.neuron)}</TableCell>
            <TableCell>{props.reconstruction.neuron.sample.animalId}</TableCell>
            <TableCell>{displayBrainArea(props.reconstruction.neuron.brainArea, "(unspecified)")}</TableCell>
            <TableCell>{props.reconstruction.neuron.x.toFixed(1)}</TableCell>
            <TableCell>{props.reconstruction.neuron.y.toFixed(1)}</TableCell>
            <TableCell>{props.reconstruction.neuron.z.toFixed(1)}</TableCell>
            <TableCell>{props.reconstruction.annotator.firstName} {props.reconstruction.annotator.lastName}</TableCell>
            <TableCell>
                <Label basic size="tiny"
                       color={reconstructionStatusColor(props.reconstruction.status)}>{reconstructionStatusString(props.reconstruction.status)}</Label>
            </TableCell>
            <TableCell>
                {approveButton}
                <Button icon="cancel" size="mini" color='red' content="Reject" onClick={() => declineAnnotation({variables: {id: props.reconstruction.id}})}/>
            </TableCell>
        </TableRow>
    );
}
