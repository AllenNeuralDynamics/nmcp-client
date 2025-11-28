export enum ReconstructionAction {
    Open = 0,
    Reopen = 1,
    Hold = 2,
    RequestPeerReview = 3,
    RequestPublishReview = 4,
    ApprovePeer = 5,
    ApprovePublish = 6,
    Publish = 7,
    Reject = 8,
    Archive = 9,
    Discard = 10,
    ReportIssue = 11
}

export const actionColor = (status: ReconstructionAction): string => {
    switch (status) {
        case ReconstructionAction.Open:
            return "cyan";
        case ReconstructionAction.Reopen:
            return "cyan";
        case ReconstructionAction.Hold:
            return "orange";
        case ReconstructionAction.RequestPeerReview:
            return "blue";
        case ReconstructionAction.RequestPublishReview:
            return "indigo"
        case ReconstructionAction.ApprovePeer:
            return "grape";
        case ReconstructionAction.ApprovePublish:
            return "grape";
        case ReconstructionAction.Publish:
            return "green";
        case ReconstructionAction.Reject:
            return "red";
        case ReconstructionAction.Archive:
            return "red";
        case ReconstructionAction.Discard:
            return "red";
        case ReconstructionAction.ReportIssue:
            return "red";
        default:
            return "black";
    }
}

export const actionName = (status: ReconstructionAction): string => {
    switch (status) {
        case ReconstructionAction.Open:
            return "Add to My Annotations";
        case ReconstructionAction.Reopen:
            return "Reopen";
        case ReconstructionAction.Hold:
            return "Hold";
        case ReconstructionAction.RequestPeerReview:
            return "Request Peer Review";
        case ReconstructionAction.RequestPublishReview:
            return "Request Publish Review"
        case ReconstructionAction.ApprovePeer:
            return "Approve";
        case ReconstructionAction.ApprovePublish:
            return "Approve";
        case ReconstructionAction.Publish:
            return "Publish";
        case ReconstructionAction.Reject:
            return "Rescind";
        case ReconstructionAction.Archive:
            return "Archive";
        case ReconstructionAction.Discard:
            return "Discard";
        case ReconstructionAction.ReportIssue:
            return "Report an Issue";
        default:
            return "UNKNOWN";
    }
}

export const actionTooltip = (status: ReconstructionAction): string => {
    switch (status) {
        case ReconstructionAction.Open:
            return "A new reconstruction will be created for this neuron and be associated with your account.";
        case ReconstructionAction.Reopen:
            return "The reconstruction will be considered in progress again.";
        case ReconstructionAction.Hold:
            return "The reconstruction will be paused and not considered in progress.";
        case ReconstructionAction.RequestPeerReview:
            return "Request a peer review of the reconstruction if annotation is complete.";
        case ReconstructionAction.RequestPublishReview:
            return "Request a full review of the reconstruction if annotation and registration is complete."
        case ReconstructionAction.ApprovePeer:
            return "Approve the specimen-space reconstruction and submit for publish review of the atlas-space reconstruction when ready."
        case ReconstructionAction.ApprovePublish:
            return "Approve the atlas-space reconstruction for automated quality control checks and be listed as ready for publication when complete.";
        case ReconstructionAction.Publish:
            return "Publish the reconstruction to the open portal search";
        case ReconstructionAction.Reject:
            return "Mark the reconstruction as not accepted.  The annotator may reopen the reconstruction and request review again after changes have been made.";
        case ReconstructionAction.Archive:
            return "The published reconstruction will be removed from the open portal search.  It will still be available as part of the neuron version history with the same DOI.";
        case ReconstructionAction.Discard:
            return `Permanently stop work on the reconstruction.  If you wish to pause annotation with the option to resume later, choose the ${actionName(ReconstructionAction.Hold)} action.`;
        case ReconstructionAction.ReportIssue:
            return "Report an issue with this candidate neuron";
        default:
            return "UNKNOWN";
    }
}

