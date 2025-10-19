import {AtlasReconstructionStatus, atlasStatusName} from "./atlasReconstructionStatus";

export function statusCanReopen(status: ReconstructionStatus): boolean {
    return status == ReconstructionStatus.PublishReview || status == ReconstructionStatus.PeerReview || status == ReconstructionStatus.OnHold || status == ReconstructionStatus.Rejected;
}

export enum ReconstructionStatus {
    Initialized = 0,
    InProgress = 100,
    OnHold = 200,
    PeerReview = 300,
    PublishReview = 400,
    Approved = 500,                         // Approved, but can not run quality checks, node assignment, etc. for some reason
    WaitingForAtlasReconstruction = 600,    // In the process of running quality checks, node assignment, etc.
    ReadyToPublish = 700,                   // Completed running quality checks, node assignment, etc.  Ready to publish.
    Rejected = 800,
    Publishing = 900,                       // In the process of search indexing, etc.
    Published = 1000,
    Archived = 5000,
    Discarded = 10000,

    // UI-only values not part of API.
    Multiple = -1000
}

export const statusName = (status: ReconstructionStatus, secondary: AtlasReconstructionStatus = AtlasReconstructionStatus.Initialized): string => {
    const reconstruction = statusNameOnly(status);
    let atlas = null;

    switch (status) {
        case ReconstructionStatus.WaitingForAtlasReconstruction:
            if (secondary != null && (secondary != AtlasReconstructionStatus.Initialized)) {
                atlas = atlasStatusName(secondary)
            }
    }

    return [reconstruction, atlas].filter(s => s).join(" - ");
}

export const statusNameOnly = (status: ReconstructionStatus): string => {
    switch (status) {
        case ReconstructionStatus.Initialized:
            return "Initialized";
        case ReconstructionStatus.InProgress:
            return "In Progress";
        case ReconstructionStatus.OnHold:
            return "On Hold";
        case ReconstructionStatus.PublishReview:
            return "In Review";
        case ReconstructionStatus.PeerReview:
            return "In Peer Review";
        case ReconstructionStatus.Approved:
            return "Approved";
        case ReconstructionStatus.WaitingForAtlasReconstruction:
            return "Finalizing";
        case ReconstructionStatus.ReadyToPublish:
            return "Ready to Publish";
        case ReconstructionStatus.Publishing:
            return "Publishing";
        case ReconstructionStatus.Published:
            return "Published";
        case ReconstructionStatus.Rejected:
            return "Returned";
        case ReconstructionStatus.Archived:
            return "Archived";
        case ReconstructionStatus.Discarded:
            return "Discarded";
        case ReconstructionStatus.Multiple:
            return "Multiple";
        default:
            return "UNKNOWN";
    }
}

export const statusColor = (status: ReconstructionStatus): string => {
    switch (status) {
        case ReconstructionStatus.Initialized:
            return "white";
        case ReconstructionStatus.InProgress:
            return "cyan";
        case ReconstructionStatus.OnHold:
            return "orange";
        case ReconstructionStatus.PeerReview:
            return "blue";
        case ReconstructionStatus.PublishReview:
            return "indigo";
        case ReconstructionStatus.Approved:
            return "grape";
        case ReconstructionStatus.WaitingForAtlasReconstruction:
            return "grape";
        case ReconstructionStatus.ReadyToPublish:
            return "teal";
        case ReconstructionStatus.Publishing:
            return "teal";
        case ReconstructionStatus.Published:
            return "green";
        case ReconstructionStatus.Rejected:
            return "red";
        case ReconstructionStatus.Discarded:
            return "red";
        case ReconstructionStatus.Archived:
            return "red";
        case ReconstructionStatus.Multiple:
            return "dimmed";
        default:
            return "black";
    }
}


