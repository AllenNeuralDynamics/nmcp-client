import {User} from "./user";
import {AtlasReconstruction} from "./atlasReconstruction";
import {AnnotationStatus} from "./annotationStatus";
import {NeuronShape} from "./neuron";
import {AtlasReconstructionStatus} from "./atlasReconstructionStatus";
import {SpecimenSpaceReconstruction} from "./specimenSpaceReconstruction";
import {RawReconstruction} from "./rawReconstruction";
import {RawReconstructionUpload} from "./rawReconstructionUpload";

export type NodeCount = {
    total: number;
    soma: number;
    path: number;
    branch: number;
    end: number;
}

export type NodeCounts = {
    axon: NodeCount;
    dendrite: NodeCount;
}

export enum ReconstructionRevisionKind {
    SpecimenSpace = 0,
    AtlasSpace = 1
}

// failedAt arrives as epoch milliseconds, like every Date-typed field here; wrap it in new Date() before use.
export type PhaseFailure = {
    phase: AtlasReconstructionStatus;
    reason?: string;
    failedAt?: Date;
}

export type Annotation = {
    id: string;
    status: AnnotationStatus;
    doi?: string;
    durationHours: number;
    notes: string;
    startedAt: Date;
    completedAt: Date;
    annotatorId: string;
    annotator: User;
    reviewer: User;
    neuron: NeuronShape;
    specimenSpaceReconstruction: SpecimenSpaceReconstruction;
    atlasReconstruction: AtlasReconstruction;
    // Only present where the query asks for them (includeRaw).
    rawReconstruction?: RawReconstruction;
    latestRawReconstructionUpload?: RawReconstructionUpload;
    // Null unless the child sits at one of the PhaseFailureStatuses.
    phaseFailure?: PhaseFailure;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export function isUserAnnotation(userId: string, annotations: Annotation[]) {
    if (!annotations || annotations.length == 0) {
        return false;
    }

    return annotations.some(a => a.annotatorId == userId);
}
