import {AtlasReconstructionStatus, atlasStatusName} from "./atlasReconstructionStatus";

export enum AnnotationStatus {
    InProgress = 100,
    OnHold = 200,
    Incomplete = 210,                       // A hold, as OnHold is: left only by resumeAnnotation.
    Duplicate = 220,                        // A hold, as OnHold is: left only by resumeAnnotation.
    PeerReview = 300,
    TeamReview = 350,
    PublishReview = 400,
    Approved = 500,                         // Approved, but can not run quality checks, node assignment, etc. for some reason
    WaitingForAtlasReconstruction = 600,    // In the process of running quality checks, node assignment, etc.
    ReadyToPublish = 700,                   // Completed running quality checks, node assignment, etc.  Ready to publish.
    Rejected = 800,
    Publishing = 900,                       // In the process of search indexing, etc.
    Published = 1000,
    PublishFailed = 1100,                   // Search indexing failed; recovery is forward-only through requestSearchIndexing.
    Archived = 5000,
    Untraceable = 6000,
    Discarded = 10000,

    // UI-only values not part of API.
    Multiple = -1000
}

export const statusName = (status: AnnotationStatus, secondary: AtlasReconstructionStatus = AtlasReconstructionStatus.Initialized): string => {
    const reconstruction = statusNameOnly(status);
    let atlas = null;

    switch (status) {
        case AnnotationStatus.WaitingForAtlasReconstruction:
        case AnnotationStatus.PublishFailed:
            if (secondary != null && (secondary != AtlasReconstructionStatus.Initialized)) {
                atlas = atlasStatusName(secondary)
            }
    }

    return [reconstruction, atlas].filter(s => s).join(" - ");
}

export const statusNameOnly = (status: AnnotationStatus): string => {
    switch (status) {
        case AnnotationStatus.InProgress:
            return "In Progress";
        case AnnotationStatus.OnHold:
            return "On Hold";
        case AnnotationStatus.Incomplete:
            return "Incomplete";
        case AnnotationStatus.Duplicate:
            return "Duplicate";
        case AnnotationStatus.PublishReview:
            return "In Publish Review";
        case AnnotationStatus.PeerReview:
            return "In Peer Review";
        case AnnotationStatus.TeamReview:
            return "In Team Review";
        case AnnotationStatus.Approved:
            return "Approved";
        case AnnotationStatus.WaitingForAtlasReconstruction:
            return "Finalizing";
        case AnnotationStatus.ReadyToPublish:
            return "Ready to Publish";
        case AnnotationStatus.Publishing:
            return "Publishing";
        case AnnotationStatus.Published:
            return "Published";
        case AnnotationStatus.PublishFailed:
            return "Publish Failed";
        case AnnotationStatus.Rejected:
            return "Returned";
        case AnnotationStatus.Archived:
            return "Archived";
        case AnnotationStatus.Untraceable:
            return "Untraceable";
        case AnnotationStatus.Discarded:
            return "Discarded";
        case AnnotationStatus.Multiple:
            return "Multiple";
        default:
            return "UNKNOWN";
    }
}

export const statusColor = (status: AnnotationStatus): string => {
    switch (status) {
        case AnnotationStatus.InProgress:
            return "cyan";
        case AnnotationStatus.OnHold:
            return "orange";
        case AnnotationStatus.PeerReview:
            return "blue";
        case AnnotationStatus.TeamReview:
            return "blue";
        case AnnotationStatus.PublishReview:
            return "indigo";
        case AnnotationStatus.Approved:
            return "grape";
        case AnnotationStatus.WaitingForAtlasReconstruction:
            return "grape";
        case AnnotationStatus.ReadyToPublish:
            return "teal";
        case AnnotationStatus.Publishing:
            return "teal";
        case AnnotationStatus.Published:
            return "green";
        case AnnotationStatus.PublishFailed:
            return "red";
        case AnnotationStatus.Rejected:
            return "red";
        case AnnotationStatus.Discarded:
            return "red";
        case AnnotationStatus.Archived:
            return "red";
        case AnnotationStatus.Incomplete:
        case AnnotationStatus.Duplicate:
        case AnnotationStatus.Untraceable:
            return "gray";
        case AnnotationStatus.Multiple:
            return "dimmed";
        default:
            return "black";
    }
}

// Multiple is a UI sentinel, and no row is ever at rest at Approved.
export function filterableAnnotationStatuses(): AnnotationStatus[] {
    return Object.values(AnnotationStatus)
        .filter((v): v is AnnotationStatus => typeof v === "number")
        .filter(s => s != AnnotationStatus.Multiple && s != AnnotationStatus.Approved);
}
