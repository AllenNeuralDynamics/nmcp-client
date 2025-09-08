import {SemanticCOLORS} from "semantic-ui-react";

export enum QualityCheckStatus {
    NotReady = 0,
    Pending = 1,
    InProgress = 2,
    Errored = 10,
    Failed = 20,
    Complete = 30
}

export function qualityCheckStatusString(status: QualityCheckStatus): string {
    switch (status) {
        case QualityCheckStatus.NotReady:
            return "Not Ready";
        case QualityCheckStatus.Pending:
            return "Pending"
        case QualityCheckStatus.InProgress:
            return "In Review";
        case QualityCheckStatus.Errored:
            return "Errored";
        case QualityCheckStatus.Failed:
            return "Failed";
        case QualityCheckStatus.Complete:
            return "Complete";
        default:
            return "Unknown";
    }
}

export function qualityCheckStatusColor(status: QualityCheckStatus): SemanticCOLORS {
    switch (status) {
        case QualityCheckStatus.NotReady:
            return "olive";
        case QualityCheckStatus.Pending:
            return "teal";
        case QualityCheckStatus.InProgress:
            return "blue";
        case QualityCheckStatus.Errored:
            return "red";
        case QualityCheckStatus.Failed:
            return "orange";
        case QualityCheckStatus.Complete:
            return "green";
        default:
            return null;
    }
}
