import {IUser} from "./user";
import {INeuron} from "./neuron";
import {Precomputed} from "./precomputed";
import {QualityCheck} from "./qualityCheck";
import {ITracing} from "./tracing";

export interface IReconstruction {
    id: string;
    status: number;
    notes: string;
    checks: string;
    durationHours: number;
    lengthMillimeters: number;
    startedAt: Date;
    completedAt: Date;
    qualityCheckAt: Date;
    qualityCheckStatus: number;
    qualityCheckVersion: string;
    qualityCheck: QualityCheck;
    annotatorId: string;
    annotator: IUser;
    proofreaderId: string;
    proofreader: IUser;
    peerReviewerId: string;
    peerReviewer: IUser;
    neuron: INeuron;
    axon: ITracing;
    dendrite: ITracing;
    precomputed?: Precomputed;
}

export function isUserReconstruction(userId: string, annotations: IReconstruction[]) {
    if (!annotations || annotations.length == 0) {
        return false;
    }

    return annotations.some(a => a.annotatorId == userId);
}
