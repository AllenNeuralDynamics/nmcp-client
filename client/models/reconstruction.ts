import {IUser} from "./user";
import {INeuron} from "./neuron";
import {ISwcTracing} from "./swcTracing";

export interface IReconstruction {
    id: string;
    status: number;
    notes: string;
    checks: string;
    durationHours: number;
    lengthMillimeters: number;
    startedAt: Date;
    completedAt: Date;
    annotatorId: string;
    annotator: IUser;
    proofreaderId: string;
    proofreader: IUser;
    neuron: INeuron;
    axon: ISwcTracing;
    dendrite: ISwcTracing;
    tracings: ISwcTracing[];
}

export function isUserReconstruction(userId: string, annotations: IReconstruction[]) {
    if (!annotations || annotations.length == 0) {
        return false;
    }

    return annotations.some(a => a.annotatorId == userId);
}
