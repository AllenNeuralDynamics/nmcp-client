import {QualityControlStatus} from "./qualityControlStatus";

export enum QualityControlTestKind {
    Error = 100,
    Warning = 200,
    Passed = 300
}

export type QualityControlTest = {
    name: string;
    safeName: string;
    description: string;
    nodes: number[];
}

export type QualityControlToolError = {
    kind: string;
    description: string;
    info?: string;
}

export type QualityOutput = {
    serviceVersion: number;
    toolVersion: string;
    score: number;
    passed: QualityControlTest[];
    warnings: QualityControlTest[];
    errors: QualityControlTest[];
    toolError?: QualityControlToolError;
    when: Date;
}

export type QualityControl = {
    id: string;
    status: QualityControlStatus;
    current?: QualityOutput;
    history?: QualityOutput[];
}
