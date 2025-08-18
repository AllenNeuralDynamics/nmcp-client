import {Button, Icon, Label, Table, TableCell, TableRow} from "semantic-ui-react";
import * as React from "react";
import {useMutation} from "@apollo/client";

import {
    APPROVE_ANNOTATION_MUTATION, ApproveAnnotationResponse, ApproveAnnotationVariables, PUBLISH_RECONSTRUCTION_MUTATION, PublishReconstructionResponse,
    PublishReconstructionVariables, DECLINE_ANNOTATION_MUTATION, DeclineAnnotationResponse, DeclineAnnotationVariables
} from "../../graphql/reconstruction";
import {IReconstruction} from "../../models/reconstruction";
import {displayNeuron} from "../../models/neuron";
import {displayBrainArea} from "../../models/brainArea";
import {ReconstructionStatus, reconstructionStatusColor, reconstructionStatusString} from "../../models/reconstructionStatus";
import {IUser} from "../../models/user";

export type ReviewTableProps = {
    reconstructions: IReconstruction[]
    totalCount: number;
    offset: number;
    limit: number;
    isFiltered: boolean;
    selected: IReconstruction;

    onRowClick(id: IReconstruction): void;
}

export const FullReviewTable = (props: ReviewTableProps) => {
    const rows = props.reconstructions.map((r: IReconstruction) => {
        return <ReviewRow key={`tt_${r.id}`} reconstruction={r} isSelected={r == props.selected} onRowClick={props.onRowClick}/>
    });

    let totalMessage = "There are no reconstructions awaiting review";

    if (props.totalCount > 0) {
        if (props.totalCount > 1) {
            totalMessage = `There are ${props.totalCount} reconstructions awaiting review`
        } else {
            totalMessage = `There is 1 reconstruction awaiting review`
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
                    <Table.HeaderCell colSpan={2} textAlign="center">Nodes</Table.HeaderCell>
                    <Table.HeaderCell rowSpan={2}>Annotator</Table.HeaderCell>
                    <Table.HeaderCell rowSpan={2}>Proofreader</Table.HeaderCell>
                    <Table.HeaderCell rowSpan={2}>Peer Reviewer</Table.HeaderCell>
                    <Table.HeaderCell rowSpan={2}>Status</Table.HeaderCell>
                    <Table.HeaderCell rowSpan={2}>Actions</Table.HeaderCell>
                </Table.Row>
                <Table.Row>
                    <Table.HeaderCell>Structure</Table.HeaderCell>
                    <Table.HeaderCell>X</Table.HeaderCell>
                    <Table.HeaderCell>Y</Table.HeaderCell>
                    <Table.HeaderCell>Z</Table.HeaderCell>
                    <Table.HeaderCell>Axon</Table.HeaderCell>
                    <Table.HeaderCell>Dendrite</Table.HeaderCell>
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

type ReviewRowProps = {
    isSelected: boolean;
    reconstruction: IReconstruction;

    onRowClick(id: IReconstruction): void;
}

const ReviewRow = (props: ReviewRowProps) => {
    const [approveAnnotation, {data: approveData}] = useMutation<ApproveAnnotationResponse, ApproveAnnotationVariables>(APPROVE_ANNOTATION_MUTATION,
        {
            refetchQueries: ["ReviewableReconstructions", "CandidatesForReview"]
        });

    const [declineAnnotation, {data: declineData}] = useMutation<DeclineAnnotationResponse, DeclineAnnotationVariables>(DECLINE_ANNOTATION_MUTATION,
        {
            refetchQueries: ["ReviewableReconstructions"]
        });

    const [completeReconstruction, {data: completeData}] = useMutation<PublishReconstructionResponse, PublishReconstructionVariables>(PUBLISH_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: ["ReviewableReconstructions", "CandidatesForReview"]
        });

    let decline = "Reject";
    let approveButton = null;
    let approveDisabled = true;
    let completeButton = null;

    if (props.reconstruction.axon != null && props.reconstruction.dendrite != null) {
        approveDisabled = false;
    }

    if (props.reconstruction.status != ReconstructionStatus.Approved) {
        approveButton = (
            <Button icon="check" size="mini" color="green" disabled={approveDisabled} content="Approve"
                    onClick={() => approveAnnotation({variables: {id: props.reconstruction.id}})}/>)
    }

    if (props.reconstruction.status == ReconstructionStatus.Approved) {
        decline = "Rescind"
    }

    if (props.reconstruction.status == ReconstructionStatus.Approved && props.reconstruction.axon != null && props.reconstruction.dendrite != null) {
        completeButton = (<Button icon="cancel" size="mini" color='teal' content="Publish"
                                  onClick={() => completeReconstruction({variables: {id: props.reconstruction.id}})}/>)
    }

    const haveAxon = props.reconstruction.axon != null
    const haveDendrite = props.reconstruction.dendrite != null

    const axonIcon = haveAxon ? null : <Icon name="attention"/>
    const dendriteIcon = haveDendrite ? null : <Icon name="attention"/>

    function userNameIfAvailable(user?: IUser): [string, "left" | "center" | "right"] {
        return user ? [`${user.firstName} ${user.lastName}`, "left"] : ["-", "center"];
    }

    const [proof, proofAlign] = userNameIfAvailable(props.reconstruction.proofreader);
    const [peer, peerAlign] = userNameIfAvailable(props.reconstruction.peerReviewer);

    return (
        <TableRow onClick={() => props.onRowClick(props.reconstruction)} active={props.isSelected}>
            <TableCell>{displayNeuron(props.reconstruction.neuron)}</TableCell>
            <TableCell>{props.reconstruction.neuron.sample.animalId}</TableCell>
            <TableCell>{displayBrainArea(props.reconstruction.neuron.brainArea, "(unspecified)")}</TableCell>
            <TableCell>{props.reconstruction.neuron.x.toFixed(1)}</TableCell>
            <TableCell>{props.reconstruction.neuron.y.toFixed(1)}</TableCell>
            <TableCell>{props.reconstruction.neuron.z.toFixed(1)}</TableCell>
            <TableCell warning={!haveAxon}>{axonIcon}{props.reconstruction.axon ? props.reconstruction.axon.nodeCount : "upload"}</TableCell>
            <TableCell warning={!haveDendrite}>{dendriteIcon}{props.reconstruction.dendrite ? props.reconstruction.dendrite.nodeCount : "upload"}</TableCell>
            <TableCell>{props.reconstruction.annotator.firstName} {props.reconstruction.annotator.lastName}</TableCell>
            <TableCell textAlign={proofAlign}>{proof}</TableCell>
            <TableCell textAlign={peerAlign}>{peer}</TableCell>
            <TableCell>
                <Label basic size="tiny"
                       color={reconstructionStatusColor(props.reconstruction.status)}>{reconstructionStatusString(props.reconstruction.status)}</Label>
            </TableCell>
            <TableCell>
                {completeButton}
                {approveButton}
                <Button icon="cancel" size="mini" color='red' content={decline} onClick={() => declineAnnotation({variables: {id: props.reconstruction.id}})}/>
            </TableCell>
        </TableRow>
    );
}
