export enum PrecomputedStatus {
    Initialized = 0,
    Pending = 100,
    Complete = 200,
    FailedToLoad = 300,
    FailedToGenerate = 400
}

export type Precomputed = {
    id: string;
    skeletonId: number;
    version: number;
}
