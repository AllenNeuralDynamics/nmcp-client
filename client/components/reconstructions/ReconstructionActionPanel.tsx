import * as React from "react";
import {useMutation} from "@apollo/react-hooks";
import {Button, Header, HeaderContent, HeaderSubheader, Icon, Label} from "semantic-ui-react";

import {IReconstruction} from "../../models/reconstruction";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {
    CANCEL_ANNOTATION_MUTATION,
    CancelAnnotationMutationResponse,
    CancelAnnotationVariables,
    REQUEST_ANNOTATION_HOLD_MUTATION,
    REQUEST_ANNOTATION_MUTATION,
    REQUEST_ANNOTATION_REVIEW_MUTATION,
    RequestAnnotationHoldResponse,
    RequestAnnotationHoldVariables,
    RequestAnnotationResponse,
    RequestAnnotationReviewResponse,
    RequestAnnotationReviewVariables,
    RequestAnnotationVariables
} from "../../graphql/reconstruction";
import {UserPreferences} from "../../util/userPreferences";


export type ReconstructionPanelProps = {
    reconstruction: IReconstruction;
    userId: string;

    showCompleteDialog(id: string): void;
}

export const ReconstructionActionPanel = (props: ReconstructionPanelProps) => {
    if (props.reconstruction == null) {
        return (<NoReconstruction/>);
    }

    const [cancelAnnotation, {data: cancelData}] = useMutation<CancelAnnotationMutationResponse, CancelAnnotationVariables>(CANCEL_ANNOTATION_MUTATION,
        {
            refetchQueries: ["ReconstructionsQuery"]
        });

    const [requestAnnotation, {data: requestData}] = useMutation<RequestAnnotationResponse, RequestAnnotationVariables>(REQUEST_ANNOTATION_MUTATION,
        {
            refetchQueries: ["ReconstructionsQuery"]
        });

    const [requestAnnotationHold, {data: holdData}] = useMutation<RequestAnnotationHoldResponse, RequestAnnotationHoldVariables>(REQUEST_ANNOTATION_HOLD_MUTATION,
        {
            refetchQueries: ["ReconstructionsQuery"]
        });

    const [requestAnnotationReview, {data: reviewData}] = useMutation<RequestAnnotationReviewResponse, RequestAnnotationReviewVariables>(REQUEST_ANNOTATION_REVIEW_MUTATION,
        {
            refetchQueries: ["ReconstructionsQuery"]
        });

    let reopenButton = null;
    let holdButton = null;
    let reviewButton = null;
    let cancelButton = null;

    if (props.reconstruction.annotatorId == props.userId) {
        if (props.reconstruction.status != ReconstructionStatus.Complete) {
            cancelButton = (
                <Button icon="cancel" size="mini" color='red' content="Cancel" onClick={() => cancelAnnotation({variables: {id: props.reconstruction.id}})}/>)
        }

        if (props.reconstruction.status == ReconstructionStatus.InReview || props.reconstruction.status == ReconstructionStatus.OnHold) {
            reopenButton = (<Button icon="folder open outline" color="green" size="mini" content="Reopen"
                                    onClick={() => requestAnnotation({variables: {id: props.reconstruction.neuron.id}})}/>)
        }

        if (props.reconstruction.status == ReconstructionStatus.InProgress) {
            reviewButton = (<Button icon="check circle outline" size="mini" color="violet" content="Request Review"
                                    onClick={() => props.showCompleteDialog(props.reconstruction.id)}/>)
            holdButton = (
                <Button icon="pause" size="mini" color="yellow" content="Hold"
                        onClick={() => requestAnnotationHold({variables: {id: props.reconstruction.id}})}/>)
        }
    }

    const info = UserPreferences.Instance.ShowReferenceIds ? (<Label mini style={{marginLeft: "8px"}}>
        <Icon name="info circle" color="blue"/>
        {props.reconstruction.id}
    </Label>) : null;

    return (
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <Header as="h4" style={{margin: 0}}>
                    <Icon name="code branch"/>
                    <HeaderContent>
                        {props.reconstruction.neuron.idString}
                        <HeaderSubheader>
                            Subject {props.reconstruction.neuron.sample.animalId}
                        </HeaderSubheader>
                    </HeaderContent>
                </Header>
                {info}
            </div>
            <div>
                {reviewButton}
                {holdButton}
                {reopenButton}
                {cancelButton}
            </div>
        </div>
    )
}

const NoReconstruction = () => (
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <Header as="h4" style={{margin: 0}}>
            <Icon name="code branch"/>
            <HeaderContent>
                No Reconstruction Selected
                <HeaderSubheader>
                    Select a reconstruction from the table to update its status if you are the annotator.
                </HeaderSubheader>
            </HeaderContent>
        </Header>
        <div></div>
    </div>
)
