import gql from "graphql-tag";
import {Reconstruction} from "../models/reconstruction";
import {ReconstructionSpace} from "../models/reconstructionSpace";
import {NEURON_BASE_FIELDS_FRAGMENT, NEURON_RELATIONSHIP_FIELDS_FRAGMENT} from "./neuron";
import {ReconstructionStatus} from "../models/reconstructionStatus";
import {AtlasReconstructionFieldsFragment} from "./atlasReconstruction";

export const NodeCountFieldsFragment = gql`fragment NodeCountFieldsFragment on NodeCount {
    total
    soma
    path
    branch
    end
}`;

export const NodeCountsFieldsFragment = gql`fragment NodeCountsFields on NodeCounts {
    axon {
        ...NodeCountFieldsFragment
    }
    dendrite {
        ...NodeCountFieldsFragment
    }
}
${NodeCountFieldsFragment}
`;

export const ReconstructionRelationshipsFragment = gql`fragment ReconstructionRelationshipsFragment on Reconstruction {
    neuron {
        ...NeuronBaseFields
        ...NeuronRelationshipFields
    }
    atlasReconstruction {
        id
        status
        sourceUrl
        nodeCounts {
            ...NodeCountsFields
        }
        qualityControl {
            id
            status
        }
    }
}
${NodeCountsFieldsFragment}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

export const ReconstructionFieldsFragment = gql`fragment ReconstructionFieldsFragment on Reconstruction {
    id
    status
    sourceUrl
    status
    notes
    durationHours
    specimenLengthMillimeters
    specimenNodeCounts {
        ...NodeCountsFields
    }
    annotatorId
    annotator {
        id
        firstName
        lastName
    }
    reviewer {
        id
        firstName
        lastName
    }
    atlasReconstruction {
        ...AtlasReconstructionFields
    }
    startedAt
    completedAt
    createdAt
    updatedAt
}
${NodeCountsFieldsFragment}
${AtlasReconstructionFieldsFragment}
`;

export const RECONSTRUCTIONS_QUERY = gql`
    query Reconstructions($queryArgs: ReconstructionQueryArgs!) {
        reconstructions(queryArgs: $queryArgs) {
            total
            offset
            reconstructions {
                ...ReconstructionFieldsFragment
                ...ReconstructionRelationshipsFragment
            }
        }
    }
    ${ReconstructionFieldsFragment}
    ${ReconstructionRelationshipsFragment}
`;

export type ReconstructionsResponse = {
    reconstructions: {
        total: number;
        offset: number;
        reconstructions: Reconstruction[];
    }
}

export type ReconstructionQueryArgs = {
    queryArgs: {
        offset?: number;
        limit?: number;
        userOnly?: boolean;
        status?: number[];
        specimenIds?: string[];
        keywords?: string[];
    }
}

//
// Modify Status
//

// Open Reconstruction Mutation
//
export const OPEN_RECONSTRUCTION_MUTATION = gql`mutation OpenReconstruction($neuronId: String!) {
    openReconstruction(neuronId: $neuronId) {
        id
    }
}`;
export type StartReconstructionArgs = {
    neuronId: string;
}
export type StartReconstructionResponse = {
    openReconstruction: Reconstruction;
}

export type ReconstructionStatusModifierArgs = {
    reconstructionId: string;
}

export const PAUSE_RECONSTRUCTION_MUTATION = gql`mutation PauseReconstruction($reconstructionId: String!) {
    pauseReconstruction(reconstructionId: $reconstructionId) {
        id
        status
    }
}`;

export type PauseReconstructionResponse = {
    pauseReconstruction: Reconstruction;
}

export const RESUME_RECONSTRUCTION_MUTATION = gql`mutation ResumeReconstruction($reconstructionId: String!) {
    resumeReconstruction(reconstructionId: $reconstructionId) {
        id
        status
    }
}`;

export type ResumeReconstructionResponse = {
    resumeReconstruction: Reconstruction;
}

export const REQUEST_REVIEW_MUTATION = gql`mutation RequestReview($reconstructionId: String!, $targetStatus: Int!, $duration: Float!, $notes: String!) {
    requestReview(reconstructionId: $reconstructionId, targetStatus: $targetStatus, duration: $duration, notes: $notes) {
        id
        status
    }
}`;

export type RequestReviewResponse = {
    resumeReconstruction: Reconstruction;
}

export type RequestReviewArgs = {
    reconstructionId: string;
    targetStatus: ReconstructionStatus;
    duration: number;
    notes: string;
}

export const APPROVE_RECONSTRUCTION_MUTATION = gql`mutation ApproveReconstruction($reconstructionId: String!, $targetStatus: Int!) {
    approveReconstruction(reconstructionId: $reconstructionId, targetStatus: $targetStatus) {
        id
        status
    }
}`;

export type ApproveReconstructionResponse = {
    resumeReconstruction: Error;
}

export type ApproveReconstructionArgs = {
    reconstructionId: string;
    targetStatus: ReconstructionStatus;
}

export const REJECT_RECONSTRUCTION_MUTATION = gql`mutation RejectReconstruction($reconstructionId: String!) {
    rejectReconstruction(reconstructionId: $reconstructionId) {
        id
        status
    }
}`;

export type RejectReconstructionResponse = {
    rejectReconstruction: Reconstruction;
}

export const DISCARD_RECONSTRUCTION_MUTATION = gql`mutation DiscardReconstruction($reconstructionId: String!) {
    discardReconstruction(reconstructionId: $reconstructionId) {
        id
    }
}`;

export type DiscardReconstructionResponse = {
    discardReconstruction: Reconstruction;
}

//
// Publish Reconstruction Mutation
//
export const PUBLISH_RECONSTRUCTION_MUTATION = gql`mutation Publish($reconstructionId: String!) {
    publish(reconstructionId: $reconstructionId) {
        id
        status
        atlasReconstruction {
            id
            status
        }
    }
}`;

export type PublishReconstructionVariables = {
    reconstructionId: string;
}

export type PublishReconstructionResponse = {
    publish: Reconstruction;
}

export const PUBLISH_ALL_RECONSTRUCTION_MUTATION = gql`mutation PublishAll($reconstructionIds: [String!]!) {
    publishAll(reconstructionIds: $reconstructionIds) {
        id
        status
        atlasReconstruction {
            id
            status
        }
    }
}`;

export type PublishAllReconstructionVariables = {
    reconstructionIds: string[];
}

export type PublishAllReconstructionResponse = {
    publishAll: Reconstruction[];
}

//
// Modify Metadata
//

export const UPDATE_RECONSTRUCTION_MUTATION = gql`mutation UpdateReconstruction($reconstructionId: String!, $duration: Float, $notes: String, $started: Date, $completed: Date) {
    updateReconstruction(reconstructionId: $reconstructionId, duration:$duration, notes:$notes, started:$started, completed:$completed) {
        id
        durationHours
        notes
        startedAt
        completedAt
    }
}`;

export type UpdateReconstructionVariables = {
    reconstructionId: string;
    duration?: number;
    notes?: string;
    started?: Date;
    completed?: Date;
}


export type UpdateReconstructionResponse = {
    updateReconstruction: Reconstruction;
}

//
// Upload/Create Unregistered Json/Swc Data
//

export const UPLOAD_JSON_MUTATION = gql`
    mutation UploadJsonData($uploadArgs: ReconstructionUploadArgs!) {
        uploadJsonData(uploadArgs: $uploadArgs) {
            id
            status
            specimenNodeCounts {
                ...NodeCountsFields
            }
            atlasReconstruction {
                ...AtlasReconstructionFields
            }
        }
    }
${NodeCountsFieldsFragment}
${AtlasReconstructionFieldsFragment}
`;

export const UPLOAD_SWC_MUTATION = gql`
    mutation UploadSwcData($uploadArgs: ReconstructionUploadArgs!) {
        uploadSwcData(uploadArgs: $uploadArgs) {
            id
            status
            specimenNodeCounts {
                ...NodeCountsFields
            }
            atlasReconstruction {
                ...AtlasReconstructionFields
            }
        }
    }
    ${NodeCountsFieldsFragment}
    ${AtlasReconstructionFieldsFragment}
`;

type UploadArgs = {
    reconstructionId: string;
    reconstructionSpace: ReconstructionSpace;
}

type ReconstructionUploadArgs = UploadArgs & {
    file: File
}

export type UploadUnregisteredJsonVariables = {
    uploadArgs: ReconstructionUploadArgs
}

export type UploadUnregisteredSwcVariables = {
    uploadArgs: ReconstructionUploadArgs
}

export type UploadJsonResponse = {
    uploadJsonData: Reconstruction;
}

export type UploadSwcResponse = {
    uploadJsonData: Reconstruction;
}
