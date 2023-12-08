import {IBrainArea} from "./brainArea";
import {ITracing} from "./tracing";
import {ISample} from "./sample";

export enum ConsensusStatus {
    Full,
    Partial,
    Single,
    Pending,
    None
}

export interface INeuron {
    id: string;
    idNumber: number;
    idString: string;
    consensus: ConsensusStatus;
    tag: string;
    keywords: string;
    x: number;
    y: number;
    z: number;
    brainArea?: IBrainArea;
    manualSomaCompartment?: IBrainArea;
    sample?: ISample;
    tracings?: ITracing[];
    createAt: Date;
    updatedAt: Date;
}
