import {User} from "./user";
import {AtlasReconstruction} from "./atlasReconstruction";
import {ReconstructionStatus} from "./reconstructionStatus";
import {NeuronShape} from "./neuron";
import {AtlasReconstructionStatus} from "./atlasReconstructionStatus";
import {QualityControl} from "./qualityControl";

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

export type Reconstruction = {
    id: string;
    sourceUrl: string;
    status: ReconstructionStatus;
    specimenNodeCounts: NodeCounts;
    specimenLengthMillimeters: number;
    durationHours: number;
    notes: string;
    startedAt: Date;
    completedAt: Date;
    annotatorId: string;
    annotator: User;
    reviewer: User;
    neuron: NeuronShape;
    atlasReconstruction: AtlasReconstruction;
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
