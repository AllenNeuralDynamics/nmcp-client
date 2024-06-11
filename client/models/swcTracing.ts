import {ITracingStructure} from "./tracingStructure";
import {INeuron} from "./neuron";
import {ISwcNode} from "./swcNode";

export interface ISwcTracing {
    id: string;
    filename: string;
    fileComments: string;
    kind: number;
    status: number;
    nodeCount: number;
    pathCount: number;
    branchCount: number;
    endCount: number;
    tracingStructure: ITracingStructure;
    neuron: INeuron;
    soma: ISwcNode;
    searchTransformAt: number;
    createdAt: number;
    updatedAt: number;
}

export interface ISwcUploadOutput {
    tracings: ISwcTracing[];
    error: Error;
}
