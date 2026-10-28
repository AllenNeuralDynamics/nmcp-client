import {AnnotationStatus} from "./annotationStatus";
import {AbandonableFailureStatuses, AtlasReconstructionStatus, PhaseFailureStatuses} from "./atlasReconstructionStatus";
import {ReconstructionAction} from "./reconstructionAction";
import {UserPermissions} from "../graphql/user";

// Mirrors the API's authorization predicates (../nmcp-api/src/models/user.ts and reconstruction.ts) so that each
// control area shows what a role can do and enables only what the API would accept.  A permission the user can never
// satisfy for this action on this reconstruction hides the button; a status that does not admit it disables it.
//
// The API's TeamReview clauses in canRejectReconstruction and canApproveReconstruction are deliberately absent: team
// review is out of scope and the client has no TeamReview permission bit.

export type Gate = { visible: boolean; enabled: boolean };

export type GateContext = {
    status: AnnotationStatus;
    childStatus?: AtlasReconstructionStatus;
    permissions: number;
    annotatorId?: string;
    userId?: string;
    area: "annotator" | "review" | "published";
};

// Source-status constants, copied member for member from ../nmcp-api/src/models/reconstruction.ts.
const UntraceableSourceStatuses: AnnotationStatus[] = [
    AnnotationStatus.InProgress,
    AnnotationStatus.OnHold,
    AnnotationStatus.Incomplete,
    AnnotationStatus.Duplicate,
    AnnotationStatus.Rejected
];

const ReviewRequestSourceStatuses: AnnotationStatus[] = [
    AnnotationStatus.InProgress,
    AnnotationStatus.Rejected
];

const PausableSourceStatuses: AnnotationStatus[] = [
    AnnotationStatus.InProgress,
    AnnotationStatus.Rejected
];

const ResumableSourceStatuses: AnnotationStatus[] = [
    AnnotationStatus.OnHold,
    AnnotationStatus.Incomplete,
    AnnotationStatus.Duplicate
];

const DiscardableSourceStatuses: AnnotationStatus[] = [
    AnnotationStatus.InProgress,
    AnnotationStatus.OnHold,
    AnnotationStatus.Incomplete,
    AnnotationStatus.Duplicate,
    AnnotationStatus.Rejected
];

const AdminDiscardableSourceStatuses: AnnotationStatus[] = [
    AnnotationStatus.PeerReview,
    AnnotationStatus.TeamReview,
    AnnotationStatus.PublishReview
];

const RejectableSourceStatuses: AnnotationStatus[] = [
    AnnotationStatus.PeerReview,
    AnnotationStatus.TeamReview,
    AnnotationStatus.PublishReview,
    AnnotationStatus.ReadyToPublish
];

// Not mirrored from the API.  The Reconstructions page closes a reconstruction only while it is still with its
// annotator, whatever the API would accept once it has gone to review, the pipeline or publishing.
const AnnotatorHeldStatuses: AnnotationStatus[] = [
    AnnotationStatus.InProgress,
    AnnotationStatus.OnHold,
    AnnotationStatus.Incomplete,
    AnnotationStatus.Duplicate,
    AnnotationStatus.Rejected
];

const hidden: Gate = {visible: false, enabled: false};

function has(permissions: number, bits: UserPermissions): boolean {
    return ((permissions ?? 0) & bits) != 0;
}

function isAdmin(ctx: GateContext): boolean {
    return has(ctx.permissions, UserPermissions.Admin);
}

function isOwner(ctx: GateContext): boolean {
    return ctx.annotatorId != null && ctx.annotatorId == ctx.userId;
}

function canOperatePipeline(ctx: GateContext): boolean {
    return isAdmin(ctx) || has(ctx.permissions, UserPermissions.PublishReview);
}

// Always the pair: a child at an abandonable failure under any other parent is not abandonable.
function isAbandonableFailure(ctx: GateContext): boolean {
    return ctx.status == AnnotationStatus.ReadyToPublish
        || (ctx.status == AnnotationStatus.WaitingForAtlasReconstruction && AbandonableFailureStatuses.includes(ctx.childStatus));
}

function isPublishFailedPair(ctx: GateContext): boolean {
    return ctx.status == AnnotationStatus.PublishFailed && ctx.childStatus == AtlasReconstructionStatus.FailedSearchIndexing;
}

function isRejectable(ctx: GateContext): boolean {
    return RejectableSourceStatuses.includes(ctx.status)
        || (ctx.status == AnnotationStatus.WaitingForAtlasReconstruction && AbandonableFailureStatuses.includes(ctx.childStatus))
        || isPublishFailedPair(ctx);
}

function canReject(ctx: GateContext): boolean {
    if (isAdmin(ctx)) {
        return true;
    }

    if (ctx.status == AnnotationStatus.PeerReview) {
        return has(ctx.permissions, UserPermissions.PeerReview);
    }

    if (ctx.status == AnnotationStatus.PublishReview || isAbandonableFailure(ctx) || isPublishFailedPair(ctx)) {
        return has(ctx.permissions, UserPermissions.PublishReview);
    }

    return false;
}

function canApprove(ctx: GateContext, targetStatus: AnnotationStatus): boolean {
    if (isAdmin(ctx)) {
        return true;
    }

    if (ctx.status == AnnotationStatus.PeerReview) {
        return has(ctx.permissions, UserPermissions.PeerReview);
    }

    if (targetStatus == AnnotationStatus.Approved) {
        return has(ctx.permissions, UserPermissions.PublishReview);
    }

    return false;
}

function canPublish(ctx: GateContext): boolean {
    return isAdmin(ctx) || has(ctx.permissions, UserPermissions.PublishReview);
}

function canDiscard(ctx: GateContext): boolean {
    if (DiscardableSourceStatuses.includes(ctx.status)) {
        return isAdmin(ctx) || isOwner(ctx);
    }

    if (AdminDiscardableSourceStatuses.includes(ctx.status)) {
        return isAdmin(ctx);
    }

    if (isAbandonableFailure(ctx)) {
        return isAdmin(ctx) || has(ctx.permissions, UserPermissions.PublishReview);
    }

    return false;
}

function ownerGate(ctx: GateContext, enabled: boolean): Gate {
    return {visible: isOwner(ctx), enabled};
}

function closeEnabled(ctx: GateContext, enabled: boolean): boolean {
    return enabled && (ctx.area != "annotator" || AnnotatorHeldStatuses.includes(ctx.status));
}

export function gateFor(action: ReconstructionAction, ctx: GateContext): Gate {
    switch (action) {
        case ReconstructionAction.Discard:
            // The annotator bar never shows owner controls on someone else's reconstruction.  The API and workflow also
            // allow reviewers to discard, but the Review tab deliberately doesn't offer it for now: a reviewer rescinds,
            // and the annotator can then choose to discard.
            return {visible: ctx.area == "annotator" && isOwner(ctx), enabled: closeEnabled(ctx, canDiscard(ctx))};
        case ReconstructionAction.Reopen:
            // Like ApprovePeer, an exception to showing whatever the role can do: reopening is rare, so the button
            // appears only while it is an option rather than sitting disabled on the bar.
            return {
                visible: isOwner(ctx) && ResumableSourceStatuses.includes(ctx.status),
                enabled: ResumableSourceStatuses.includes(ctx.status)
            };
        case ReconstructionAction.Hold:
        case ReconstructionAction.MarkIncomplete:
        case ReconstructionAction.MarkDuplicate:
            return ownerGate(ctx, closeEnabled(ctx, PausableSourceStatuses.includes(ctx.status)));
        case ReconstructionAction.RequestPeerReview:
        case ReconstructionAction.RequestPublishReview:
            return ownerGate(ctx, ReviewRequestSourceStatuses.includes(ctx.status));
        case ReconstructionAction.MarkUntraceable:
            // The API and workflow also let peer and publish reviewers and admins mark a reconstruction untraceable,
            // but the annotator bar offers it only to the reconstruction's own annotator.
            return ownerGate(ctx, closeEnabled(ctx, UntraceableSourceStatuses.includes(ctx.status)));
        case ReconstructionAction.Reject:
            // A peer reviewer can reject at some status, so visibility does not depend on this one.
            return {visible: isAdmin(ctx) || has(ctx.permissions, UserPermissions.ReviewAll), enabled: isRejectable(ctx) && canReject(ctx)};
        case ReconstructionAction.ApprovePeer:
            // An exception to showing whatever the role can do: two Approve buttons side by side confuse, so anyone
            // who also sees ApprovePublish gets this one only while it is actually an option.
            return {
                visible: (isAdmin(ctx) || has(ctx.permissions, UserPermissions.PeerReview))
                    && (!gateFor(ReconstructionAction.ApprovePublish, ctx).visible || ctx.status == AnnotationStatus.PeerReview),
                enabled: ctx.status == AnnotationStatus.PeerReview && canApprove(ctx, AnnotationStatus.PublishReview)
            };
        case ReconstructionAction.ApprovePublish:
            return {
                visible: isAdmin(ctx) || has(ctx.permissions, UserPermissions.PublishReview),
                enabled: ctx.status == AnnotationStatus.PublishReview && ctx.childStatus == AtlasReconstructionStatus.ReadyToProcess && canApprove(ctx, AnnotationStatus.Approved)
            };
        case ReconstructionAction.Publish:
            return {visible: canPublish(ctx), enabled: ctx.status == AnnotationStatus.ReadyToPublish};
        case ReconstructionAction.RetryPhase:
            // The Published page retries only the one status it surfaces; a pipeline failure listed there stays the
            // Review tab's to retry.
            return {
                visible: canOperatePipeline(ctx),
                enabled: ctx.area == "published" ? isPublishFailedPair(ctx) : PhaseFailureStatuses.includes(ctx.childStatus)
            };
        case ReconstructionAction.ResetPipeline:
            // The API and workflow also allow publish reviewers to replay the pipeline, but for now only admins are
            // offered it.
            return {visible: isAdmin(ctx), enabled: isAbandonableFailure(ctx)};
        default:
            return hidden;
    }
}
