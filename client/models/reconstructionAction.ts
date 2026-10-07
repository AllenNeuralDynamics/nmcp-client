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
    Discard = 10,
    ReportIssue = 11,
    CreateRevision = 12,
    MarkUntraceable = 13,
    RetryPhase = 14,
    ResetPipeline = 15,
    MarkIncomplete = 16,
    MarkDuplicate = 17
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
        case ReconstructionAction.Discard:
            return "red";
        case ReconstructionAction.ReportIssue:
            return "red";
        case ReconstructionAction.CreateRevision:
            return "orange";
        case ReconstructionAction.MarkUntraceable:
            return "gray";
        case ReconstructionAction.RetryPhase:
            return "orange";
        case ReconstructionAction.ResetPipeline:
            return "orange";
        case ReconstructionAction.MarkIncomplete:
            return "gray";
        case ReconstructionAction.MarkDuplicate:
            return "gray";
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
        case ReconstructionAction.Discard:
            return "Discard";
        case ReconstructionAction.ReportIssue:
            return "Report an Issue";
        case ReconstructionAction.CreateRevision:
            return "Create Revision";
        case ReconstructionAction.MarkUntraceable:
            return "Untraceable";
        case ReconstructionAction.RetryPhase:
            return "Retry Phase";
        case ReconstructionAction.ResetPipeline:
            return "Replay Pipeline";
        case ReconstructionAction.MarkIncomplete:
            return "Incomplete";
        case ReconstructionAction.MarkDuplicate:
            return "Duplicate";
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
        case ReconstructionAction.Discard:
            return "Permanently stop work on the reconstruction.  This cannot be undone.";
        case ReconstructionAction.ReportIssue:
            return "Report an issue with this candidate neuron";
        case ReconstructionAction.CreateRevision:
            return "Create a new revision of the specimen-space or atlas-space reconstruction for the associated neuron.";
        case ReconstructionAction.MarkUntraceable:
            return "The neuron cannot be traced.  The reconstruction will be withdrawn and the neuron returned to the candidate pool.";
        case ReconstructionAction.RetryPhase:
            return "Re-run the automated phase that failed for this reconstruction.";
        case ReconstructionAction.ResetPipeline:
            return "Discard the current atlas-space pipeline run and start it again from the beginning.";
        case ReconstructionAction.MarkIncomplete:
            return "The reconstruction will be set aside as incomplete and not considered in progress.  It can be reopened later.";
        case ReconstructionAction.MarkDuplicate:
            return "The reconstruction will be set aside as a duplicate and not considered in progress.  It can be reopened later.";
        default:
            return "UNKNOWN";
    }
}

