import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Modal} from "semantic-ui-react";

import {
    REQUEST_ANNOTATION_REVIEW_MUTATION,
    REQUEST_PEER_REVIEW_MUTATION,
    RequestAnnotationReviewResponse,
    RequestAnnotationReviewVariables,
    RequestPeerReviewResponse,
    RequestPeerReviewVariables
} from "../../graphql/reconstruction";
import {RequestReviewPanel} from "./RequestReviewPanel";
import {ReconstructionStatus} from "../../models/reconstructionStatus";

export type CompleteReconstructionDialogProps = {
    id: string;
    show: boolean;
    requestedStatus: ReconstructionStatus;
    onClose(): void;
}

export const RequestReviewDialog = (props: CompleteReconstructionDialogProps) => {
    const [state, setState] = useState({
        duration: "",
        length: "",
        notes: "",
        checks: "",
    })

    const [requestReview] = useMutation<RequestAnnotationReviewResponse, RequestAnnotationReviewVariables>(REQUEST_ANNOTATION_REVIEW_MUTATION,
        {
            refetchQueries: ["ReconstructionsQuery"]
        });

    const [requestPeerReview] = useMutation<RequestPeerReviewResponse, RequestPeerReviewVariables>(REQUEST_PEER_REVIEW_MUTATION,
        {
            refetchQueries: ["ReconstructionsQuery"]
        });

    const updateDuration = (value: string) => setState({...state, duration: value});
    const updateLength = (value: string) => setState({...state, length: value});
    const updateNotes = (value: string) => setState({...state, notes: value});
    const updateChecks = (value: string) => setState({...state, checks: value});

    const canMarkAsComplete = (state.duration.trim().length == 0 || !isNaN(parseFloat(state.duration))) &&
        (state.length.trim().length == 0 || !isNaN(parseFloat(state.length)));

    const onRequestReview = async () => {
        const duration = state.duration.trim().length == 0 ? 0 : parseFloat(state.duration);
        const length = state.length.trim().length == 0 ? 0 : parseFloat(state.length);

        if (props.requestedStatus == ReconstructionStatus.InPeerReview) {
            await requestPeerReview({variables: {id: props.id, duration: duration, length: length, notes: state.notes, checks: state.checks}});
        } else {
            await requestReview({variables: {id: props.id, duration: duration, length: length, notes: state.notes, checks: state.checks}});
        }

        props.onClose();
    }

    const review = props.requestedStatus == ReconstructionStatus.InPeerReview ? "Peer Review" : "Review";

    return (
        <Modal closeIcon centered={false} open={props.show} onClose={props.onClose} dimmer="blurring">
            <Modal.Header content={`Mark Reconstruction for ${review}`}/>
            <Modal.Content>
                <RequestReviewPanel id={props.id} data={state} updateDuration={updateDuration} updateLength={updateLength} updateNotes={updateNotes}
                                    updateChecks={updateChecks}/>
            </Modal.Content>
            <Modal.Actions>
                <Button color="blue" content={`Request ${review}`} disabled={!canMarkAsComplete} onClick={onRequestReview}/>
                <Button content="Cancel" onClick={props.onClose}/>
            </Modal.Actions>
        </Modal>
    );
}
