import {SemanticCOLORS} from "semantic-ui-react";

export enum ReconstructionStatus {
    Unknown = 0,
    InProgress = 1,
    OnHold = 2,
    InReview = 3,
    InPeerReview = 4,
    Approved = 5,
    Rejected = 6,
    Published = 8,
    Invalid = 99
}

export function reconstructionStatusString(status: ReconstructionStatus): string {
    switch (status) {
        case ReconstructionStatus.InProgress:
            return "In Progress";
        case ReconstructionStatus.OnHold:
            return "On Hold";
        case ReconstructionStatus.InReview:
            return "In Review";
        case ReconstructionStatus.InPeerReview:
            return "In Peer Review";
        case ReconstructionStatus.Approved:
            return "Approved";
        case ReconstructionStatus.Rejected:
            return "Rejected";
        case ReconstructionStatus.Published:
            return "Published";
        default:
            return "Unknown";
    }
}

export function reconstructionStatusColor(status: ReconstructionStatus): SemanticCOLORS {
    switch (status) {
        case ReconstructionStatus.InProgress:
            return "green";
        case ReconstructionStatus.OnHold:
            return "orange";
        case ReconstructionStatus.InReview:
            return "blue";
        case ReconstructionStatus.InPeerReview:
            return "orange";
        case ReconstructionStatus.Approved:
            return "purple";
        case ReconstructionStatus.Rejected:
            return "red";
        case ReconstructionStatus.Published:
            return "teal";
        default:
            return null;
    }
}
