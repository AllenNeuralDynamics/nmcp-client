import {ITracing} from "./tracing";
import {IBrainArea} from "./brainArea";

export interface IBrainCompartment {
    id: string;
    nodeCount: number;
    somaCount: number;
    pathCount: number;
    branchCount: number;
    endCount: number;
    tracing?: ITracing;
    brainArea?: IBrainArea;
}
