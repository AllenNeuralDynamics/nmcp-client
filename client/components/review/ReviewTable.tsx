import {Button, Label, Table, TableCell, TableRow} from "semantic-ui-react";
import * as React from "react";
import {useMutation, useQuery} from "@apollo/react-hooks";

import {
    APPROVE_ANNOTATION_MUTATION,
    ApproveAnnotationResponse,
    ApproveAnnotationVariables, COMPLETE_ANNOTATION_MUTATION, CompleteReconstructionResponse, CompleteReconstructionVariables,
    DECLINE_ANNOTATION_MUTATION, DeclineAnnotationResponse, DeclineAnnotationVariables,
    REVIEWABLE_ANNOTATIONS_QUERY,
    ReviewableAnnotationsResponse
} from "../../graphql/reconstruction";
import {IReconstruction} from "../../models/reconstruction";
import {displayNeuron} from "../../models/neuron";
import {displayBrainArea} from "../../models/brainArea";
import {AnnotationStatus, annotationStatusColor, displayAnnotationStatus} from "../../models/annotationStatus";

export type ReviewTableProps = {
    reconstructions: IReconstruction[]
    selected: IReconstruction;

    onRowClick(id: IReconstruction): void;
}

export const ReviewTable = (props: ReviewTableProps) => {
    const rows = props.reconstructions.map((r: IReconstruction) => {
        return <ReviewRow key={`tt_${r.id}`} reconstruction={r} isSelected={r == props.selected} onRowClick={props.onRowClick}/>
    });

    const totalCount = props.reconstructions.length;

    let totalMessage = "There are no reconstructions awaiting review";

    if (totalCount > 0) {
        if (totalCount > 1) {
            totalMessage = `There are ${totalCount} reconstructions awaiting review`
        } else {
            totalMessage = `There is 1 reconstruction awaiting review`
        }
    }

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
                    <Table.HeaderCell colSpan={9}>
                        {totalMessage}
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    );
}

export type ReviewRowProps = {
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

    const [completeReconstruction, {data: completeData}] = useMutation<CompleteReconstructionResponse, CompleteReconstructionVariables>(COMPLETE_ANNOTATION_MUTATION,
        {
            refetchQueries: ["ReviewableReconstructions", "CandidatesForReview"]
        });

    let decline = "Decline";
    let approveButton = null;
    let completeButton = null;

    if (props.reconstruction.status != AnnotationStatus.Approved) {
        approveButton = (
            <Button icon="check" size="mini" color='green' content="Approve" onClick={() => approveAnnotation({variables: {id: props.reconstruction.id}})}/>)
    } else {
        decline = "Rescind"
    }

    if (props.reconstruction.status == AnnotationStatus.Approved && props.reconstruction.axon != null && props.reconstruction.dendrite != null) {
        completeButton = (<Button icon="cancel" size="mini" color='blue' content="Mark as Complete"
                                  onClick={() => completeReconstruction({variables: {id: props.reconstruction.id}})}/>)
    }

    return (
        <TableRow onClick={() => props.onRowClick(props.reconstruction)} active={props.isSelected}>
            <TableCell>{displayNeuron(props.reconstruction.neuron)}</TableCell>
            <TableCell>{props.reconstruction.neuron.sample.animalId}</TableCell>
            <TableCell>{displayBrainArea(props.reconstruction.neuron.brainArea, "(unspecified)")}</TableCell>
            <TableCell>{props.reconstruction.neuron.x}</TableCell>
            <TableCell>{props.reconstruction.neuron.y}</TableCell>
            <TableCell>{props.reconstruction.neuron.z}</TableCell>
            <TableCell>{props.reconstruction.annotator.firstName} {props.reconstruction.annotator.lastName}</TableCell>
            <TableCell><Label
                color={annotationStatusColor(props.reconstruction.status)}>{displayAnnotationStatus(props.reconstruction.status)}</Label></TableCell>
            <TableCell>
                <Button icon="eye" size="mini" color='blue' content="View"/>
                {completeButton}
                {approveButton}
                <Button icon="cancel" size="mini" color='red' content={decline} onClick={() => declineAnnotation({variables: {id: props.reconstruction.id}})}/>
            </TableCell>
        </TableRow>
    );
}
