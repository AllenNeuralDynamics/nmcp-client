import gql from "graphql-tag";
import {IReconstruction} from "../models/reconstruction";
import {INeuron} from "../models/neuron";

export const ReconstructionFieldsFragment = gql`fragment ReconstructionFields on Reconstruction {
    id
    status
    notes
    checks
    durationHours
    lengthMillimeters
    startedAt
    completedAt
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
    }
    dendrite {
        id
        nodeCount
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
// Reconstructions for User
//
export const RECONSTRUCTIONS_FOR_USER_QUERY = gql`query ReconstructionsForUser {
    reconstructionsForUser {
        ...ReconstructionFields
    }
}
${ReconstructionFieldsFragment}`;

export type ReconstructionsForUserResponse = {
    reconstructionsForUser: IReconstruction[];
}

//
// Reviewable Annotations
//
export const REVIEWABLE_ANNOTATIONS_QUERY = gql`query ReviewableReconstructions {
    reviewableReconstructions {
        ...ReconstructionFields
    }
}
${ReconstructionFieldsFragment}`;

export type ReviewableAnnotationsResponse = {
    reviewableReconstructions: IReconstruction[];
}

//
// Request Reconstruction Mutation
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
// Request Review Mutation
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
// Request Review Mutation
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
// Complete Reconstruction Mutation
//
export const COMPLETE_ANNOTATION_MUTATION = gql`mutation CompleteAnnotation($id: String!) {
    completeReconstruction(id: $id) {
        message
        name
    }
}`;

export type CompleteReconstructionVariables = {
    id: string;
}

export type CompleteReconstructionResponse = {
    completeReconstruction: ErrorOutput;
}
