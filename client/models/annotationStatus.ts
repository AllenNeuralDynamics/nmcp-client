import {SemanticCOLORS} from "semantic-ui-react";

export enum AnnotationStatus {
    Unknown,
    InProgress,
    OnHold,
    InReview,
    Returned,
    Approved,
    Rejected,
    Cancelled,
    Complete
}

export function displayAnnotationStatus(status: AnnotationStatus): string {
    switch (status) {
        case AnnotationStatus.InProgress:
            return "In Progress";
        case AnnotationStatus.OnHold:
            return "On Hold";
        case AnnotationStatus.InReview:
            return "In Review";
        case AnnotationStatus.Returned:
            return "Returned";
        case AnnotationStatus.Approved:
            return "Approved";
        case AnnotationStatus.Rejected:
            return "Rejected";
        case AnnotationStatus.Cancelled:
            return "Cancelled";
        case AnnotationStatus.Complete:
            return "Complete";
        default:
            return "Unknown";
    }
}

export function annotationStatusColor(status: AnnotationStatus): SemanticCOLORS {
    switch (status) {
        case AnnotationStatus.InProgress:
            return "green";
        case AnnotationStatus.OnHold:
            return "yellow";
        case AnnotationStatus.InReview:
            return "blue";
        case AnnotationStatus.Returned:
            return "orange";
        case AnnotationStatus.Approved:
            return "violet";
        case AnnotationStatus.Rejected:
            return "red";
        case AnnotationStatus.Cancelled:
            return null;
        case AnnotationStatus.Complete:
            return "teal";
        default:
            return null;
    }
}
