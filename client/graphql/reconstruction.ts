import gql from "graphql-tag";
import {DocumentNode} from "graphql";

import {Reconstruction, ReconstructionRevisionKind} from "../models/reconstruction";
import {ReconstructionSpace} from "../models/reconstructionSpace";
import {NEURON_BASE_FIELDS_FRAGMENT, NEURON_RELATIONSHIP_FIELDS_FRAGMENT} from "./neuron";
import {ReconstructionStatus} from "../models/reconstructionStatus";
import {AtlasReconstructionStatus} from "../models/atlasReconstructionStatus";
import {AtlasReconstruction} from "../models/atlasReconstruction";
import {AtlasReconstructionFieldsFragment} from "./atlasReconstruction";
import {QualityControlFieldsFragment} from "./qualityControl";

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
        ...AtlasReconstructionFields
        nodeCounts {
            ...NodeCountsFields
        }
        qualityControl {
            ...QualityControlFields
        }
    }
}
${AtlasReconstructionFieldsFragment}
${NodeCountsFieldsFragment}
${QualityControlFieldsFragment}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

export const ReconstructionFieldsFragment = gql`fragment ReconstructionFieldsFragment on Reconstruction {
    id
    status
    sourceUrl
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
    phaseFailure {
        phase
        reason
        failedAt
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

export type ReconstructionStatusFilter = {
    status: ReconstructionStatus;
    atlasStatus?: AtlasReconstructionStatus[];
};

// status and statusFilters are alternatives: the API refuses a query that sends both non-empty.
export type ReconstructionQueryArgs = {
    queryArgs: {
        offset?: number;
        limit?: number;
        userOnly?: boolean;
        status?: number[];
        statusFilters?: ReconstructionStatusFilter[];
        specimenIds?: string[];
        keywords?: string[];
    }
}

//
// Modify Status
//

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

//
// Pause/Hold Reconstruction Mutation
//
export const PAUSE_RECONSTRUCTION_MUTATION = gql`mutation PauseReconstruction($reconstructionId: String!) {
    pauseReconstruction(reconstructionId: $reconstructionId) {
        id
        status
    }
}`;

//
// Resume Reconstruction Mutation
//
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

//
// Request Review Mutation
//
export const REQUEST_REVIEW_MUTATION = gql`mutation RequestReview($reconstructionId: String!, $targetStatus: Int!, $duration: Float, $notes: String) {
    requestReview(reconstructionId: $reconstructionId, targetStatus: $targetStatus, duration: $duration, notes: $notes) {
        id
        status
    }
}`;

export type RequestReviewResponse = {
    requestReview: Reconstruction;
}

export type RequestReviewArgs = {
    reconstructionId: string;
    targetStatus: ReconstructionStatus;
    duration?: number;
    notes?: string;
}

//
// Approve Reconstruction Mutation
//
export const APPROVE_RECONSTRUCTION_MUTATION = gql`mutation ApproveReconstruction($reconstructionId: String!, $targetStatus: Int!) {
    approveReconstruction(reconstructionId: $reconstructionId, targetStatus: $targetStatus) {
        id
        status
    }
}`;

export type ApproveReconstructionResponse = {
    approveReconstruction: Reconstruction;
}

export type ApproveReconstructionArgs = {
    reconstructionId: string;
    targetStatus: ReconstructionStatus;
}

//
// Reject Reconstruction Mutation
//
export const REJECT_RECONSTRUCTION_MUTATION = gql`mutation RejectReconstruction($reconstructionId: String!) {
    rejectReconstruction(reconstructionId: $reconstructionId) {
        id
        status
    }
}`;

export type RejectReconstructionResponse = {
    rejectReconstruction: Reconstruction;
}

//
// Discard Reconstruction Mutation
//
export const DISCARD_RECONSTRUCTION_MUTATION = gql`mutation DiscardReconstruction($reconstructionId: String!) {
    discardReconstruction(reconstructionId: $reconstructionId) {
        id
    }
}`;

export type DiscardReconstructionResponse = {
    discardReconstruction: Reconstruction;
}

export const MARK_UNTRACEABLE_MUTATION = gql`mutation MarkReconstructionUntraceable($reconstructionId: String!) {
    markReconstructionUntraceable(reconstructionId: $reconstructionId) {
        id
        status
    }
}`;

export type MarkUntraceableResponse = {
    markReconstructionUntraceable: Reconstruction;
}

export const MARK_INCOMPLETE_MUTATION = gql`mutation MarkReconstructionIncomplete($reconstructionId: String!) {
    markReconstructionIncomplete(reconstructionId: $reconstructionId) {
        id
        status
    }
}`;

export type MarkIncompleteResponse = {
    markReconstructionIncomplete: Reconstruction;
}

export const MARK_DUPLICATE_MUTATION = gql`mutation MarkReconstructionDuplicate($reconstructionId: String!) {
    markReconstructionDuplicate(reconstructionId: $reconstructionId) {
        id
        status
    }
}`;

export type MarkDuplicateResponse = {
    markReconstructionDuplicate: Reconstruction;
}

export const REQUEST_QUALITY_CONTROL_REASSESSMENT_MUTATION = gql`mutation RequestQualityControlReassessment($reconstructionId: String!) {
    requestQualityControlReassessment(reconstructionId: $reconstructionId) {
        ...AtlasReconstructionFields
    }
}
${AtlasReconstructionFieldsFragment}
`;

export type RequestQualityControlReassessmentResponse = {
    requestQualityControlReassessment: AtlasReconstruction;
}

export const REQUEST_STRUCTURE_ASSIGNMENT_MUTATION = gql`mutation RequestStructureAssignment($reconstructionId: String!) {
    requestStructureAssignment(reconstructionId: $reconstructionId) {
        ...AtlasReconstructionFields
    }
}
${AtlasReconstructionFieldsFragment}
`;

export type RequestStructureAssignmentResponse = {
    requestStructureAssignment: AtlasReconstruction;
}

export const REQUEST_PRECOMPUTED_REGENERATION_MUTATION = gql`mutation RequestPrecomputedRegeneration($reconstructionId: String!) {
    requestPrecomputedRegeneration(reconstructionId: $reconstructionId) {
        ...AtlasReconstructionFields
    }
}
${AtlasReconstructionFieldsFragment}
`;

export type RequestPrecomputedRegenerationResponse = {
    requestPrecomputedRegeneration: AtlasReconstruction;
}

export const REQUEST_DOI_ASSIGNMENT_MUTATION = gql`mutation RequestDoiAssignment($reconstructionId: String!) {
    requestDoiAssignment(reconstructionId: $reconstructionId) {
        ...AtlasReconstructionFields
    }
}
${AtlasReconstructionFieldsFragment}
`;

export type RequestDoiAssignmentResponse = {
    requestDoiAssignment: AtlasReconstruction;
}

export const REQUEST_SEARCH_INDEXING_MUTATION = gql`mutation RequestSearchIndexing($reconstructionId: String!) {
    requestSearchIndexing(reconstructionId: $reconstructionId) {
        ...AtlasReconstructionFields
    }
}
${AtlasReconstructionFieldsFragment}
`;

export type RequestSearchIndexingResponse = {
    requestSearchIndexing: AtlasReconstruction;
}

// Only one retry can ever apply: the failed phase is the last one that ran.
export const RETRY_PHASE_MUTATIONS: Partial<Record<AtlasReconstructionStatus, DocumentNode>> = {
    [AtlasReconstructionStatus.FailedQualityControl]: REQUEST_QUALITY_CONTROL_REASSESSMENT_MUTATION,
    [AtlasReconstructionStatus.FailedStructureAssignment]: REQUEST_STRUCTURE_ASSIGNMENT_MUTATION,
    [AtlasReconstructionStatus.FailedPrecomputed]: REQUEST_PRECOMPUTED_REGENERATION_MUTATION,
    [AtlasReconstructionStatus.FailedDoiAssignment]: REQUEST_DOI_ASSIGNMENT_MUTATION,
    [AtlasReconstructionStatus.FailedSearchIndexing]: REQUEST_SEARCH_INDEXING_MUTATION
};

export const RESET_RECONSTRUCTION_PIPELINE_MUTATION = gql`mutation ResetReconstructionPipeline($reconstructionId: String!) {
    resetReconstructionPipeline(reconstructionId: $reconstructionId) {
        ...AtlasReconstructionFields
    }
}
${AtlasReconstructionFieldsFragment}
`;

export type ResetReconstructionPipelineResponse = {
    resetReconstructionPipeline: AtlasReconstruction;
}

//
// Publish Reconstruction Mutation
//
export const PUBLISH_RECONSTRUCTION_MUTATION = gql`mutation Publish($reconstructionId: String! $replaceExisting: Boolean) {
    publish(reconstructionId: $reconstructionId, replaceExisting: $replaceExisting) {
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
    replaceExisting: boolean;
}

export type PublishReconstructionResponse = {
    publish: Reconstruction;
}

//
// Publish All Reconstruction Mutation
//

// Mirrors the API's PublishAllLimit: the most ids one call accepts, and the most an "ALL" request publishes per call.
export const PublishAllLimit = 50;

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
// Open Reconstruction Revision Mutation
//
export const OPEN_RECONSTRUCTION_REVISION_MUTATION = gql`mutation OpenReconstructionRevision($reconstructionId: String!, $revisionKind: Int!) {
    openReconstructionRevision(reconstructionId: $reconstructionId, revisionKind: $revisionKind) {
        id
        status
    }
}`;

export type OpenReconstructionRevisionVariables = {
    reconstructionId: string;
    revisionKind: ReconstructionRevisionKind;
}

export type OpenReconstructionRevisionResponse = {
    openReconstructionRevision: Reconstruction;
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
// Upload/Create Unregistered Swc Data
//

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

export type UploadUnregisteredSwcVariables = {
    uploadArgs: ReconstructionUploadArgs
}

export type UploadSwcResponse = {
    uploadJsonData: Reconstruction;
}
