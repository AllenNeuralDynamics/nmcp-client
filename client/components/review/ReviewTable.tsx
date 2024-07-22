import {Button, Icon, Label, Table, TableCell, TableRow} from "semantic-ui-react";
import * as React from "react";
import {useMutation} from "@apollo/react-hooks";

import {
    APPROVE_ANNOTATION_MUTATION, ApproveAnnotationResponse, ApproveAnnotationVariables, COMPLETE_ANNOTATION_MUTATION, CompleteReconstructionResponse,
    CompleteReconstructionVariables, DECLINE_ANNOTATION_MUTATION, DeclineAnnotationResponse, DeclineAnnotationVariables
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
                    <Table.HeaderCell colSpan={2} textAlign="center">Nodes</Table.HeaderCell>
                    <Table.HeaderCell rowSpan={2}>Annotator</Table.HeaderCell>
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
                    <Table.HeaderCell colSpan={11}>
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

    let decline = "Reject";
    let approveButton = null;
    let completeButton = null;

    if (props.reconstruction.status != AnnotationStatus.Approved && props.reconstruction.axon != null && props.reconstruction.dendrite != null) {
        approveButton = (
            <Button icon="check" size="mini" color='green' content="Approve" onClick={() => approveAnnotation({variables: {id: props.reconstruction.id}})}/>)
    }

    if (props.reconstruction.status == AnnotationStatus.Approved) {
        decline = "Rescind"
    }

    if (props.reconstruction.status == AnnotationStatus.Approved && props.reconstruction.axon != null && props.reconstruction.dendrite != null) {
        completeButton = (<Button icon="cancel" size="mini" color='teal' content="Publish"
                                  onClick={() => completeReconstruction({variables: {id: props.reconstruction.id}})}/>)
    }

    const haveAxon = props.reconstruction.axon != null
    const haveDendrite = props.reconstruction.dendrite != null

    const axonIcon = haveAxon ? null : <Icon name="attention"/>
    const dendriteIcon = haveDendrite ? null : <Icon name="attention"/>

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
            <TableCell>
                <Label basic size="tiny"
                       color={annotationStatusColor(props.reconstruction.status)}>{displayAnnotationStatus(props.reconstruction.status)}</Label>
            </TableCell>
            <TableCell>
                <Button icon="eye" size="mini" color='blue' content="View"/>
                {completeButton}
                {approveButton}
                <Button icon="cancel" size="mini" color='red' content={decline} onClick={() => declineAnnotation({variables: {id: props.reconstruction.id}})}/>
            </TableCell>
        </TableRow>
    );
}
