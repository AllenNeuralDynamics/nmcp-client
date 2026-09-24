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
    PendingDoiAssignment = 585,
    InDoiAssignment = 590,
    FailedDoiAssignment = 595,
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
        case AtlasReconstructionStatus.PendingRegistration:
            return "Pending Registration";
        case AtlasReconstructionStatus.InRegistration:
            return "In Registration";
        case AtlasReconstructionStatus.FailedRegistration:
            return "Failed Registration";
        case AtlasReconstructionStatus.PendingQualityControl:
            return "Pending Automated QC";
        case AtlasReconstructionStatus.InQualityControl:
            return "In Automated QC";
        case AtlasReconstructionStatus.FailedQualityControl:
            return "Failed QC";
        case AtlasReconstructionStatus.PendingStructureAssignment:
            return "Pending Automated Structure Assignment";
        case AtlasReconstructionStatus.InStructureAssignment:
            return "In Automated Structure Assignment";
        case AtlasReconstructionStatus.FailedStructureAssignment:
            return "Failed Structure Assignment";
        case AtlasReconstructionStatus.PendingPrecomputed:
            return "Pending Automated Precomputed Generation";
        case AtlasReconstructionStatus.InPrecomputed:
            return "In Automated Precomputed Generation";
        case AtlasReconstructionStatus.FailedPrecomputed:
            return "Failed Precomputed Generation";
        case AtlasReconstructionStatus.PendingDoiAssignment:
            return "Pending DOI Assignment";
        case AtlasReconstructionStatus.InDoiAssignment:
            return "In DOI Assignment";
        case AtlasReconstructionStatus.FailedDoiAssignment:
            return "Failed DOI Assignment";
        case AtlasReconstructionStatus.ReadyToPublish:
            return "Ready to Finalize";
        case AtlasReconstructionStatus.PendingSearchIndexing:
            return "Pending Search Indexing";
        case AtlasReconstructionStatus.InSearchIndexing:
            return "In Search Indexing";
        case AtlasReconstructionStatus.FailedSearchIndexing:
            return "Failed Search Indexing";
        case AtlasReconstructionStatus.Published:
            return "Finalized";
        case AtlasReconstructionStatus.Discarded:
            return "Discarded";
        case AtlasReconstructionStatus.Multiple:
            return "Multiple";
        default:
            return "Unknown";
    }
}

export function statusColor(status: AtlasReconstructionStatus): string {
    switch (status) {
        case AtlasReconstructionStatus.Initialized:
            return "gray";
        case AtlasReconstructionStatus.ReadyToProcess:
            return "cyan";
        case AtlasReconstructionStatus.PendingRegistration:
            return "indigo";
        case AtlasReconstructionStatus.InRegistration:
            return "indigo";
        case AtlasReconstructionStatus.FailedRegistration:
            return "red";
        case AtlasReconstructionStatus.PendingQualityControl:
            return "grape";
        case AtlasReconstructionStatus.InQualityControl:
            return "grape";
        case AtlasReconstructionStatus.FailedQualityControl:
            return "red";
        case AtlasReconstructionStatus.PendingStructureAssignment:
            return "orange";
        case AtlasReconstructionStatus.InStructureAssignment:
            return "orange";
        case AtlasReconstructionStatus.FailedStructureAssignment:
            return "red";
        case AtlasReconstructionStatus.PendingPrecomputed:
            return "yellow";
        case AtlasReconstructionStatus.InPrecomputed:
            return "yellow";
        case AtlasReconstructionStatus.FailedPrecomputed:
            return "red";
        case AtlasReconstructionStatus.PendingDoiAssignment:
            return "lime";
        case AtlasReconstructionStatus.InDoiAssignment:
            return "lime";
        case AtlasReconstructionStatus.FailedDoiAssignment:
            return "red";
        case AtlasReconstructionStatus.ReadyToPublish:
            return "green";
        case AtlasReconstructionStatus.PendingSearchIndexing:
            return "blue";
        case AtlasReconstructionStatus.InSearchIndexing:
            return "blue";
        case AtlasReconstructionStatus.FailedSearchIndexing:
            return "red";
        case AtlasReconstructionStatus.Published:
            return "green";
        case AtlasReconstructionStatus.Discarded:
            return "red";
        case AtlasReconstructionStatus.Multiple:
            return "dimmed";
        default:
            return null;
    }
}

// Mirrors ../nmcp-api/src/models/atlasReconstructionStatus.ts.  Registration (200/220/240) is a manual upload, not a
// worker phase, so it belongs in none of these.

// What the derived phaseFailure field treats as a blocked phase.
export const PhaseFailureStatuses: AtlasReconstructionStatus[] = [
    AtlasReconstructionStatus.FailedQualityControl,
    AtlasReconstructionStatus.FailedStructureAssignment,
    AtlasReconstructionStatus.FailedPrecomputed,
    AtlasReconstructionStatus.FailedDoiAssignment,
    AtlasReconstructionStatus.FailedSearchIndexing
];

// The failed phases a reconstruction may be abandoned or replayed from.  FailedSearchIndexing is absent:
// requestSearchIndexing is its only remedy.
export const AbandonableFailureStatuses: AtlasReconstructionStatus[] = [
    AtlasReconstructionStatus.FailedQualityControl,
    AtlasReconstructionStatus.FailedStructureAssignment,
    AtlasReconstructionStatus.FailedPrecomputed,
    AtlasReconstructionStatus.FailedDoiAssignment
];

// The Review tab's "In automatic processing" bucket.
export const AutomaticPhaseInProgressStatuses: AtlasReconstructionStatus[] = [
    AtlasReconstructionStatus.PendingQualityControl,
    AtlasReconstructionStatus.InQualityControl,
    AtlasReconstructionStatus.PendingStructureAssignment,
    AtlasReconstructionStatus.InStructureAssignment,
    AtlasReconstructionStatus.PendingPrecomputed,
    AtlasReconstructionStatus.InPrecomputed,
    AtlasReconstructionStatus.PendingDoiAssignment,
    AtlasReconstructionStatus.InDoiAssignment
];
