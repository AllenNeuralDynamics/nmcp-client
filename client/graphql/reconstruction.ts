import gql from "graphql-tag";
import {IReconstruction} from "../models/reconstruction";
import {INeuron} from "../models/neuron";
import {QualityCheckStatus} from "../models/qualityCheckStatus";

export const ReconstructionFieldsFragment = gql`fragment ReconstructionFields on Reconstruction {
    id
    status
    notes
    checks
    durationHours
    lengthMillimeters
    startedAt
    completedAt
    qualityCheckStatus
    annotatorId
    annotator {
        id
        firstName
        lastName
        emailAddress
    }
    proofreaderId
    proofreader {
        id
        firstName
        lastName
        emailAddress
    }
    peerReviewerId
    peerReviewer {
        id
        firstName
        lastName
        emailAddress
    }
    neuronId
    neuron {
        id
        idNumber
        idString
        tag
        keywords
        x
        y
        z
        brainArea {
            id
            name
        }
        sample {
            id
            animalId
        }
    }
    axon {
        id
        nodeCount
        filename
    }
    dendrite {
        id
        nodeCount
        filename
    }
    precomputed {
        id
        skeletonSegmentId
    }
}`;

//
// All Reconstructions
//
export const RECONSTRUCTIONS_QUERY = gql`query ReconstructionsQuery ($pageInput: ReconstructionPageInput) {
    reconstructions(pageInput: $pageInput) {
        offset
        limit
        totalCount
        reconstructions {
            ...ReconstructionFields
        }
    }
}
${ReconstructionFieldsFragment}`;

export type ReconstructionVariables = {
    pageInput: {
        offset: number;
        limit: number;
        userOnly: boolean;
        sampleIds?: string[];
        filters: number[];
    }
}

export type ReconstructionsResponse = {
    reconstructions: {
        offset: number;
        limit: number;
        totalCount: number;
        reconstructions: IReconstruction[];
    };
}

//
// Reviewable Annotations
//

export type ReviewableVariables = {
    input: {
        offset: number;
        limit: number;
        sampleIds: string[];
        status: number[];
    }
}

export type ReviewableResponse = {
    reviewableReconstructions: {
        offset: number;
        limit: number;
        totalCount: number;
        reconstructions: IReconstruction[];
    };
}

export const REVIEWABLE_ANNOTATIONS_QUERY = gql`query ReviewableReconstructions($input: ReviewPageInput) {
    reviewableReconstructions(input: $input) {
        offset
        limit
        totalCount
        reconstructions {
            ...ReconstructionFields
        }
    }
}
${ReconstructionFieldsFragment}`;

//
// Peer Reviewable Annotations
//

export type PeerReviewableVariables = {
    input: {
        offset: number;
        limit: number;
        sampleIds: string[];
        tag: string;
    }
}

export type PeerReviewableResponse = {
    peerReviewableReconstructions: {
        offset: number;
        limit: number;
        totalCount: number;
        reconstructions: IReconstruction[];
    };
}

export const PEER_REVIEWABLE_ANNOTATIONS_QUERY = gql`query PeerReviewableReconstructions($input: PeerReviewPageInput) {
    peerReviewableReconstructions(input: $input) {
        offset
        limit
        totalCount
        reconstructions {
            ...ReconstructionFields
        }
    }
}
${ReconstructionFieldsFragment}`;

//
// Request Annotation Mutation
//
export const REQUEST_ANNOTATION_MUTATION = gql`mutation RequestAnnotation($id: String!) {
    requestReconstruction(id: $id) {
        id
    }
}`;

export type RequestAnnotationVariables = {
    id: string;
}

export type RequestAnnotationResponse = {
    requestReconstruction: INeuron;
}

//
// Request Peer Review Mutation
//
export const REQUEST_PEER_REVIEW_MUTATION = gql`mutation RequestPeerReview($id: String!, $duration: Float!, $length: Float!, $notes: String!, $checks: String!) {
    requestReconstructionPeerReview(id: $id, duration: $duration, length: $length, notes: $notes, checks: $checks) {
        message
        name
    }
}`;

export type RequestPeerReviewVariables = {
    id: string;
    duration: number;
    length: number;
    notes: string;
    checks: string;
}

export type RequestPeerReviewResponse = {
    requestReconstructionPeerReview: ErrorOutput;
}


//
// Request Review Mutation
//
export const REQUEST_ANNOTATION_REVIEW_MUTATION = gql`mutation RequestAnnotationReview($id: String!, $duration: Float!, $length: Float!, $notes: String!, $checks: String!) {
    requestReconstructionReview(id: $id, duration: $duration, length: $length, notes: $notes, checks: $checks) {
        message
        name
    }
}`;

export type RequestAnnotationReviewVariables = {
    id: string;
    duration: number;
    length: number;
    notes: string;
    checks: string;
}

export type RequestAnnotationReviewResponse = {
    requestReconstructionReview: ErrorOutput;
}

//
//
//
export const UPDATE_RECONSTRUCTION_MUTATION = gql`mutation UpdateReconstruction($id: String!, $duration: Float!, $length: Float!, $notes: String!, $checks: String!) {
    updateReconstruction(id: $id, duration: $duration, length: $length, notes: $notes, checks: $checks) {
        message
        name
    }
}`;

export type UpdateReconstructionVariables = RequestAnnotationReviewVariables;

export type UpdateReconstructionResponse = RequestAnnotationReviewResponse;

//
//
//
export const REQUEST_ANNOTATION_HOLD_MUTATION = gql`mutation RequestAnnotationHold($id: String!) {
    requestReconstructionHold(id: $id) {
        message
        name
    }
}`;

export type RequestAnnotationHoldVariables = {
    id: string;
}

export type RequestAnnotationHoldResponse = {
    requestReconstructionHold: ErrorOutput;
}

//
// Approve Reconstruction Peer Review Mutation
//
export const APPROVE_RECONSTRUCTION_PEER_REVIEW_MUTATION = gql`mutation ApproveReconstructionPeerReview($id: String!) {
    approveReconstructionPeerReview(id: $id) {
        message
        name
    }
}`;

export type ApproveReconstructionPeerReviewVariables = {
    id: string;
}

export type ApproveReconstructionPeerReviewResponse = {
    approveReconstructionPeerReview: ErrorOutput;
}

//
// Approve Annotation Mutation
//
export const APPROVE_ANNOTATION_MUTATION = gql`mutation ApproveAnnotation($id: String!) {
    approveReconstruction(id: $id) {
        message
        name
    }
}`;

export type ApproveAnnotationVariables = {
    id: string;
}

export type ApproveAnnotationResponse = {
    approveReconstruction: ErrorOutput;
}

//
// Decline Annotation Mutation
//
export const DECLINE_ANNOTATION_MUTATION = gql`mutation DeclineAnnotation($id: String!) {
    declineReconstruction(id: $id) {
        message
        name
    }
}`;

export type DeclineAnnotationVariables = {
    id: string;
}

export type DeclineAnnotationResponse = {
    declineReconstruction: ErrorOutput;
}

//
// Cancel Annotation Mutation
//
export const CANCEL_ANNOTATION_MUTATION = gql`mutation CancelAnnotation($id: String!) {
    cancelReconstruction(id: $id) {
        message
        name
    }
}`;

type ErrorOutput = {
    kind?: number;
    message: string;
    name: string;
}

export type CancelAnnotationVariables = {
    id: string;
}

export type CancelAnnotationMutationResponse = {
    cancelReconstruction: ErrorOutput;
}

//
// Publish Reconstruction Mutation
//
export const PUBLISH_RECONSTRUCTION_MUTATION = gql`mutation PublishReconstruction($id: String!) {
    publishReconstruction(id: $id) {
        message
        name
    }
}`;

export type PublishReconstructionVariables = {
    id: string;
}

export type PublishReconstructionResponse = {
    publishReconstruction: ErrorOutput;
}

// Request Quality Check Mutation
export const QUALITY_CHECK_MUTATION = gql`mutation QualityCheck($id: String!) {
    requestQualityCheck(id: $id) {
        id
        qualityCheckStatus
        error {
            kind
            message
        }
    }
}`;

export type QualityCheckVariables = {
    id: string;
}

export type QualityCheckResponse = {
    requestQualityCheck: {
        id: string,
        qualityCheckStatus: QualityCheckStatus,
        error: ErrorOutput
    };
}

