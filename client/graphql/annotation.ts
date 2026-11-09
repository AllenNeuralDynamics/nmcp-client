import gql from "graphql-tag";
import {DocumentNode} from "graphql";

import {Annotation, ReconstructionRevisionKind} from "../models/annotation";
import {ReconstructionSpace} from "../models/reconstructionSpace";
import {RawReconstructionUpload} from "../models/rawReconstructionUpload";
import {NEURON_BASE_FIELDS_FRAGMENT, NEURON_RELATIONSHIP_FIELDS_FRAGMENT} from "./neuron";
import {AnnotationStatus} from "../models/annotationStatus";
import {AtlasReconstructionStatus} from "../models/atlasReconstructionStatus";
import {AtlasReconstruction} from "../models/atlasReconstruction";
import {AtlasReconstructionFieldsFragment} from "./atlasReconstruction";
import {AtlasQualityControlFieldsFragment} from "./atlasQualityControl";

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

export const AnnotationRelationshipsFragment = gql`fragment AnnotationRelationshipsFragment on Annotation {
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
            ...AtlasQualityControlFields
        }
    }
}
${AtlasReconstructionFieldsFragment}
${NodeCountsFieldsFragment}
${AtlasQualityControlFieldsFragment}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

export const AnnotationFieldsFragment = gql`fragment AnnotationFieldsFragment on Annotation {
    id
    status
    notes
    durationHours
    specimenSpaceReconstruction {
        id
        sourceUrl
        lengthMillimeters
        nodeCounts {
            ...NodeCountsFields
        }
        soma {
            id
            x
            y
            z
        }
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

// The raw fields resolve per row, so only the Reconstructions page asks for them.  A refetch by document keeps each
// query's own variables.
export const ANNOTATIONS_QUERY = gql`
    query Annotations($queryArgs: AnnotationQueryArgs!, $includeRaw: Boolean = false) {
        annotations(queryArgs: $queryArgs) {
            total
            offset
            annotations {
                ...AnnotationFieldsFragment
                ...AnnotationRelationshipsFragment
                rawReconstruction @include(if: $includeRaw) {
                    id
                    notes
                    uploadedAt
                    nodeCounts {
                        ...NodeCountsFields
                    }
                }
                latestRawReconstructionUpload @include(if: $includeRaw) {
                    id
                    attemptNumber
                    status
                    sourceFilename
                    format
                    failureMessage
                    qcTag
                    qualityControlUrl
                    createdAt
                    updatedAt
                    user {
                        id
                        firstName
                        lastName
                    }
                }
            }
        }
    }
    ${AnnotationFieldsFragment}
    ${AnnotationRelationshipsFragment}
`;

export type AnnotationsResponse = {
    annotations: {
        total: number;
        offset: number;
        annotations: Annotation[];
    }
}

export type AnnotationStatusFilter = {
    status: AnnotationStatus;
    atlasStatus?: AtlasReconstructionStatus[];
};

// status and statusFilters are alternatives: the API refuses a query that sends both non-empty.
export type AnnotationQueryArgs = {
    queryArgs: {
        offset?: number;
        limit?: number;
        userOnly?: boolean;
        status?: number[];
        statusFilters?: AnnotationStatusFilter[];
        specimenIds?: string[];
        keywords?: string[];
    }
    includeRaw?: boolean;
}

//
// Modify Status
//

//
// Open Annotation Mutation
//
export const OPEN_ANNOTATION_MUTATION = gql`mutation OpenAnnotation($neuronId: String!) {
    openAnnotation(neuronId: $neuronId) {
        id
    }
}`;
export type OpenAnnotationArgs = {
    neuronId: string;
}
export type OpenAnnotationResponse = {
    openAnnotation: Annotation;
}

export type AnnotationStatusModifierArgs = {
    annotationId: string;
}

//
// Pause/Hold Annotation Mutation
//
export const PAUSE_ANNOTATION_MUTATION = gql`mutation PauseAnnotation($annotationId: String!) {
    pauseAnnotation(annotationId: $annotationId) {
        id
        status
    }
}`;

//
// Resume Annotation Mutation
//
export type PauseAnnotationResponse = {
    pauseAnnotation: Annotation;
}

export const RESUME_ANNOTATION_MUTATION = gql`mutation ResumeAnnotation($annotationId: String!) {
    resumeAnnotation(annotationId: $annotationId) {
        id
        status
    }
}`;

export type ResumeAnnotationResponse = {
    resumeAnnotation: Annotation;
}

//
// Request Review Mutation
//
export const REQUEST_REVIEW_MUTATION = gql`mutation RequestReview($annotationId: String!, $targetStatus: Int!, $duration: Float, $notes: String) {
    requestReview(annotationId: $annotationId, targetStatus: $targetStatus, duration: $duration, notes: $notes) {
        id
        status
    }
}`;

export type RequestReviewResponse = {
    requestReview: Annotation;
}

export type RequestReviewArgs = {
    annotationId: string;
    targetStatus: AnnotationStatus;
    duration?: number;
    notes?: string;
}

//
// Approve Annotation Mutation
//
export const APPROVE_ANNOTATION_MUTATION = gql`mutation ApproveAnnotation($annotationId: String!, $targetStatus: Int!) {
    approveAnnotation(annotationId: $annotationId, targetStatus: $targetStatus) {
        id
        status
    }
}`;

export type ApproveAnnotationResponse = {
    approveAnnotation: Annotation;
}

export type ApproveAnnotationArgs = {
    annotationId: string;
    targetStatus: AnnotationStatus;
}

//
// Reject Annotation Mutation
//
export const REJECT_ANNOTATION_MUTATION = gql`mutation RejectAnnotation($annotationId: String!) {
    rejectAnnotation(annotationId: $annotationId) {
        id
        status
    }
}`;

export type RejectAnnotationResponse = {
    rejectAnnotation: Annotation;
}

//
// Discard Annotation Mutation
//
export const DISCARD_ANNOTATION_MUTATION = gql`mutation DiscardAnnotation($annotationId: String!) {
    discardAnnotation(annotationId: $annotationId) {
        id
    }
}`;

export type DiscardAnnotationResponse = {
    discardAnnotation: Annotation;
}

export const MARK_UNTRACEABLE_MUTATION = gql`mutation MarkAnnotationUntraceable($annotationId: String!) {
    markAnnotationUntraceable(annotationId: $annotationId) {
        id
        status
    }
}`;

export type MarkUntraceableResponse = {
    markAnnotationUntraceable: Annotation;
}

export const MARK_INCOMPLETE_MUTATION = gql`mutation MarkAnnotationIncomplete($annotationId: String!) {
    markAnnotationIncomplete(annotationId: $annotationId) {
        id
        status
    }
}`;

export type MarkIncompleteResponse = {
    markAnnotationIncomplete: Annotation;
}

export const MARK_DUPLICATE_MUTATION = gql`mutation MarkAnnotationDuplicate($annotationId: String!) {
    markAnnotationDuplicate(annotationId: $annotationId) {
        id
        status
    }
}`;

export type MarkDuplicateResponse = {
    markAnnotationDuplicate: Annotation;
}

export const REQUEST_QUALITY_CONTROL_REASSESSMENT_MUTATION = gql`mutation RequestQualityControlReassessment($annotationId: String!) {
    requestQualityControlReassessment(annotationId: $annotationId) {
        ...AtlasReconstructionFields
    }
}
${AtlasReconstructionFieldsFragment}
`;

export type RequestQualityControlReassessmentResponse = {
    requestQualityControlReassessment: AtlasReconstruction;
}

export const REQUEST_STRUCTURE_ASSIGNMENT_MUTATION = gql`mutation RequestStructureAssignment($annotationId: String!) {
    requestStructureAssignment(annotationId: $annotationId) {
        ...AtlasReconstructionFields
    }
}
${AtlasReconstructionFieldsFragment}
`;

export type RequestStructureAssignmentResponse = {
    requestStructureAssignment: AtlasReconstruction;
}

export const REQUEST_PRECOMPUTED_REGENERATION_MUTATION = gql`mutation RequestPrecomputedRegeneration($annotationId: String!) {
    requestPrecomputedRegeneration(annotationId: $annotationId) {
        ...AtlasReconstructionFields
    }
}
${AtlasReconstructionFieldsFragment}
`;

export type RequestPrecomputedRegenerationResponse = {
    requestPrecomputedRegeneration: AtlasReconstruction;
}

export const REQUEST_DOI_ASSIGNMENT_MUTATION = gql`mutation RequestDoiAssignment($annotationId: String!) {
    requestDoiAssignment(annotationId: $annotationId) {
        ...AtlasReconstructionFields
    }
}
${AtlasReconstructionFieldsFragment}
`;

export type RequestDoiAssignmentResponse = {
    requestDoiAssignment: AtlasReconstruction;
}

export const REQUEST_SEARCH_INDEXING_MUTATION = gql`mutation RequestSearchIndexing($annotationId: String!) {
    requestSearchIndexing(annotationId: $annotationId) {
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

export const RESET_RECONSTRUCTION_PIPELINE_MUTATION = gql`mutation ResetReconstructionPipeline($annotationId: String!) {
    resetReconstructionPipeline(annotationId: $annotationId) {
        ...AtlasReconstructionFields
    }
}
${AtlasReconstructionFieldsFragment}
`;

export type ResetReconstructionPipelineResponse = {
    resetReconstructionPipeline: AtlasReconstruction;
}

//
// Publish Annotation Mutation
//
export const PUBLISH_ANNOTATION_MUTATION = gql`mutation Publish($annotationId: String! $replaceExisting: Boolean) {
    publish(annotationId: $annotationId, replaceExisting: $replaceExisting) {
        id
        status
        atlasReconstruction {
            id
            status
        }
    }
}`;

export type PublishAnnotationVariables = {
    annotationId: string;
    replaceExisting: boolean;
}

export type PublishAnnotationResponse = {
    publish: Annotation;
}

//
// Publish All Annotation Mutation
//

// Mirrors the API's PublishAllLimit: the most ids one call accepts, and the most an "ALL" request publishes per call.
export const PublishAllLimit = 50;

export const PUBLISH_ALL_ANNOTATION_MUTATION = gql`mutation PublishAll($annotationIds: [String!]!) {
    publishAll(annotationIds: $annotationIds) {
        id
        status
        atlasReconstruction {
            id
            status
        }
    }
}`;

export type PublishAllAnnotationVariables = {
    annotationIds: string[];
}

export type PublishAllAnnotationResponse = {
    publishAll: Annotation[];
}

//
// Open Annotation Revision Mutation
//
export const OPEN_ANNOTATION_REVISION_MUTATION = gql`mutation OpenAnnotationRevision($annotationId: String!, $revisionKind: Int!) {
    openAnnotationRevision(annotationId: $annotationId, revisionKind: $revisionKind) {
        id
        status
    }
}`;

export type OpenAnnotationRevisionVariables = {
    annotationId: string;
    revisionKind: ReconstructionRevisionKind;
}

export type OpenAnnotationRevisionResponse = {
    openAnnotationRevision: Annotation;
}

//
// Modify Metadata
//

export const UPDATE_ANNOTATION_MUTATION = gql`mutation UpdateAnnotation($annotationId: String!, $duration: Float, $notes: String, $started: Date, $completed: Date) {
    updateAnnotation(annotationId: $annotationId, duration:$duration, notes:$notes, started:$started, completed:$completed) {
        id
        durationHours
        notes
        startedAt
        completedAt
    }
}`;

export type UpdateAnnotationVariables = {
    annotationId: string;
    duration?: number;
    notes?: string;
    started?: Date;
    completed?: Date;
}


export type UpdateAnnotationResponse = {
    updateAnnotation: Annotation;
}

//
// Upload/Create Unregistered Swc Data
//

export const UPLOAD_SWC_MUTATION = gql`
    mutation UploadSwcData($uploadArgs: ReconstructionUploadArgs!) {
        uploadSwcData(uploadArgs: $uploadArgs) {
            id
            status
            specimenSpaceReconstruction {
                id
                nodeCounts {
                    ...NodeCountsFields
                }
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
    annotationId: string;
    reconstructionSpace: ReconstructionSpace;
}

type ReconstructionUploadArgs = UploadArgs & {
    file: File
}

export type UploadUnregisteredSwcVariables = {
    uploadArgs: ReconstructionUploadArgs
}

export type UploadSwcResponse = {
    uploadJsonData: Annotation;
}

export const UPLOAD_RAW_SWC_MUTATION = gql`
    mutation UploadRawSwcData($uploadArgs: RawReconstructionUploadArgs!) {
        uploadRawSwcData(uploadArgs: $uploadArgs) {
            id
            annotationId
            attemptNumber
            status
            sourceFilename
            failureMessage
        }
    }
`;

export type UploadRawSwcVariables = {
    uploadArgs: {
        annotationId: string;
        notes?: string;
        file: File;
    }
}

export type UploadRawSwcResponse = {
    uploadRawSwcData: RawReconstructionUpload;
}
