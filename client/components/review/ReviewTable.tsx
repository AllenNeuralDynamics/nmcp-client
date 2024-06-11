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

export const ReviewTable = () => {
    const {loading, error, data} = useQuery<ReviewableAnnotationsResponse>(REVIEWABLE_ANNOTATIONS_QUERY);

    if (loading) {
        return (<div/>)
    }

    const rows = data.reviewableReconstructions.map((t: IReconstruction) => {
        return <ReviewRow key={`tt_${t.id}`} annotation={t}/>
    });

    return (
        <Table attached="bottom" compact="very">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Neuron</Table.HeaderCell>
                    <Table.HeaderCell>Soma Structure</Table.HeaderCell>
                    <Table.HeaderCell>Soma X</Table.HeaderCell>
                    <Table.HeaderCell>Soma Y</Table.HeaderCell>
                    <Table.HeaderCell>Soma Z</Table.HeaderCell>
                    <Table.HeaderCell>Annotator</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {rows}
            </Table.Body>
        </Table>
    );
}

interface IReviewRowProps {
    annotation: IReconstruction;
}

const ReviewRow = (props: IReviewRowProps) => {
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

    if (props.annotation.status != AnnotationStatus.Approved) {
        approveButton = (<Button icon="check" size="mini" color='green' content="Approve" onClick={() => approveAnnotation({variables: {id: props.annotation.id}})}/>)
    } else {
        decline = "Rescind"
    }

    if (props.annotation.status == AnnotationStatus.Approved && props.annotation.axon != null && props.annotation.dendrite != null) {
        completeButton = (<Button icon="cancel" size="mini" color='blue' content="Mark as Complete" onClick={() => completeReconstruction({variables: {id: props.annotation.id}})}/>)
    }

    return (<TableRow>
            <TableCell>{displayNeuron(props.annotation.neuron)}</TableCell>
            <TableCell>{displayBrainArea(props.annotation.neuron.brainArea, "(unspecified)")}</TableCell>
            <TableCell>{props.annotation.neuron.x}</TableCell>
            <TableCell>{props.annotation.neuron.y}</TableCell>
            <TableCell>{props.annotation.neuron.z}</TableCell>
            <TableCell>{props.annotation.annotator.firstName} {props.annotation.annotator.lastName}</TableCell>
            <TableCell><Label color={annotationStatusColor(props.annotation.status)}>{displayAnnotationStatus(props.annotation.status)}</Label></TableCell>
            <TableCell>
                <Button icon="eye" size="mini" color='blue' content="View"/>
                {completeButton}
                {approveButton}
                <Button icon="cancel" size="mini" color='red' content={decline} onClick={() => declineAnnotation({variables: {id: props.annotation.id}})}/>
            </TableCell>
        </TableRow>
    );
}
