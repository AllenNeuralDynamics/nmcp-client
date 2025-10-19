import {QualityControlStatus} from "./qualityControlStatus";

export type QualityCheckError = {
    testName: string;
    testDescription: string;
    affectedNodes: number[];
}

export type OldQualityControl = {
    standardMorphVersion?: string
    errors: QualityCheckError[];
    warnings: QualityCheckError[];
}

export type QualityControl = {
    id: string;
    status: QualityControlStatus
}
