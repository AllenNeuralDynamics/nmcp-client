export enum AtlasReconstructionStatus {
    Initialized = 0,
    ReadyToProcess = 100,
    PendingRegistration = 200,
    InRegistration = 220,
    FailedRegistration = 240,
    PendingQualityControl = 300,
    InQualityControl = 320,
    FailedQualityControl = 340,
    PendingStructureAssignment = 400,
    InStructureAssignment = 420,
    FailedStructureAssignment = 440,
    PendingPrecomputed = 500,
    InPrecomputed = 540,
    FailedPrecomputed = 580,
    ReadyToPublish = 600,
    PendingSearchIndexing = 700,
    InSearchIndexing = 720,
    FailedSearchIndexing = 740,
    Published = 1000,
    Discarded = 2000,

    // UI only
    Multiple = -1000
}

export function atlasStatusName(status: AtlasReconstructionStatus): string {
    switch (status) {
        case AtlasReconstructionStatus.Initialized:
            return "Initialized";
        case AtlasReconstructionStatus.ReadyToProcess:
            return "Ready to Process";
        case AtlasReconstructionStatus.PendingQualityControl:
            return "Pending QC";
        case AtlasReconstructionStatus.FailedQualityControl:
            return "Failed QC";
        case AtlasReconstructionStatus.PendingStructureAssignment:
            return "Pending Structure Assignment";
        case AtlasReconstructionStatus.FailedStructureAssignment:
            return "Failed Structure Assignment";
        case AtlasReconstructionStatus.PendingPrecomputed:
            return "Pending Precomputed Generation";
        case AtlasReconstructionStatus.FailedPrecomputed:
            return "Failed Precomputed Generation";
        case AtlasReconstructionStatus.ReadyToPublish:
            return "Ready to Finalize";
        case AtlasReconstructionStatus.PendingSearchIndexing:
            return "Pending Search Indexing";
        case AtlasReconstructionStatus.FailedSearchIndexing:
            return "Failed Search Indexing";
        case AtlasReconstructionStatus.Published:
            return "Finalized";
        default:
            return "Unknown";
    }
}

export function statusColor(status: AtlasReconstructionStatus): string {
    switch (status) {
        case AtlasReconstructionStatus.Initialized:
            return "Initialized";
        case AtlasReconstructionStatus.ReadyToProcess:
            return "cyan";
        case AtlasReconstructionStatus.PendingQualityControl:
            return "grape";
        case AtlasReconstructionStatus.FailedQualityControl:
            return "red";
        case AtlasReconstructionStatus.PendingStructureAssignment:
            return "orange";
        case AtlasReconstructionStatus.PendingPrecomputed:
            return "yellow";
        case AtlasReconstructionStatus.FailedPrecomputed:
            return "red";
        case AtlasReconstructionStatus.ReadyToPublish:
            return "green";
        case AtlasReconstructionStatus.FailedStructureAssignment:
            return "red";
        case AtlasReconstructionStatus.PendingSearchIndexing:
            return "blue";
        case AtlasReconstructionStatus.FailedSearchIndexing:
            return "red";
        case AtlasReconstructionStatus.Published:
            return "green";
        default:
            return null;
    }
}
