import {User} from "./user";
import {AtlasReconstruction} from "./atlasReconstruction";
import {ReconstructionStatus} from "./reconstructionStatus";
import {NeuronShape} from "./neuron";
import {Precomputed} from "./precomputed";
import {AtlasReconstructionStatus} from "./atlasReconstructionStatus";
import {SpecimenNode} from "./specimenNode";

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

export type Reconstruction = {
    id: string;
    sourceUrl: string;
    status: ReconstructionStatus;
    specimenNodeCounts: NodeCounts;
    specimenLengthMillimeters: number;
    soma?: SpecimenNode;
    durationHours: number;
    notes: string;
    startedAt: Date;
    completedAt: Date;
    annotatorId: string;
    annotator: User;
    reviewer: User;
    neuron: NeuronShape;
    precomputed: Precomputed;
    atlasReconstruction: AtlasReconstruction;
    // Null unless the child sits at one of the PhaseFailureStatuses.
    phaseFailure?: PhaseFailure;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export function isUserReconstruction(userId: string, reconstructions: Reconstruction[]) {
    if (!reconstructions || reconstructions.length == 0) {
        return false;
    }

    return reconstructions.some(a => a.annotatorId == userId);
}
