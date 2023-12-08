import {ISwcTracing} from "./swcTracing";
import {IRegistrationTransform} from "./registrationTransform";
import {ITracingNode} from "./tracingNode";
import {ITracingStructure} from "./tracingStructure";

export enum ExportFormat {
    SWC = 0,
    JSON = 1
}

export interface ITransformProgress {
    startedAt: Date;
    inputNodeCount: number;
    outputNodeCount: number;
}

export interface ITracing {
    id: string;
    nodeCount?: number;
    firstNode?: ITracingNode;
    soma?: ITracingNode;
    swcTracing?: ISwcTracing;
    nodes?: ITracingNode[];
    keyNodes?: ITracingNode[];
    registrationTransform?: IRegistrationTransform;
    transformStatus?: ITransformProgress;
    transformedAt?: number;
    tracingStructure?: ITracingStructure;
    createdAt?: number;
    updatedAt?: number;
}

export interface ITracingPage {
    offset: number;
    limit: number;
    totalCount: number;
    matchCount: number;
    tracings: ITracing[];
}
