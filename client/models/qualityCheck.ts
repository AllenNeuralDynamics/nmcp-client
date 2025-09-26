export type QualityCheckError = {
    testName: string;
    testDescription: string;
    affectedNodes: number[];
}

export type QualityCheck = {
    standardMorphVersion?: string
    errors: QualityCheckError[];
    warnings: QualityCheckError[];
}
