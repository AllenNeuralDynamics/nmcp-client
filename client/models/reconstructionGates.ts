import {ReconstructionStatus, statusCanReopen} from "./reconstructionStatus";
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
    status: ReconstructionStatus;
    childStatus?: AtlasReconstructionStatus;
    permissions: number;
    annotatorId?: string;
    userId?: string;
    area: "annotator" | "review" | "published";
};

// Source-status constants, copied member for member from ../nmcp-api/src/models/reconstruction.ts.
const UntraceableSourceStatuses: ReconstructionStatus[] = [
    ReconstructionStatus.InProgress,
    ReconstructionStatus.OnHold,
    ReconstructionStatus.Rejected
];

const ReviewRequestSourceStatuses: ReconstructionStatus[] = [
    ReconstructionStatus.InProgress,
    ReconstructionStatus.Rejected
];

const PausableSourceStatuses: ReconstructionStatus[] = [
    ReconstructionStatus.InProgress,
    ReconstructionStatus.Rejected
];

const DiscardableSourceStatuses: ReconstructionStatus[] = [
    ReconstructionStatus.InProgress,
    ReconstructionStatus.OnHold,
    ReconstructionStatus.Rejected
];

const AdminDiscardableSourceStatuses: ReconstructionStatus[] = [
    ReconstructionStatus.PeerReview,
    ReconstructionStatus.TeamReview,
    ReconstructionStatus.PublishReview
];

const RejectableSourceStatuses: ReconstructionStatus[] = [
    ReconstructionStatus.PeerReview,
    ReconstructionStatus.TeamReview,
    ReconstructionStatus.PublishReview,
    ReconstructionStatus.ReadyToPublish
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
    return ctx.status == ReconstructionStatus.ReadyToPublish
        || (ctx.status == ReconstructionStatus.WaitingForAtlasReconstruction && AbandonableFailureStatuses.includes(ctx.childStatus));
}

function isPublishFailedPair(ctx: GateContext): boolean {
    return ctx.status == ReconstructionStatus.PublishFailed && ctx.childStatus == AtlasReconstructionStatus.FailedSearchIndexing;
}

function isRejectable(ctx: GateContext): boolean {
    return RejectableSourceStatuses.includes(ctx.status)
        || (ctx.status == ReconstructionStatus.WaitingForAtlasReconstruction && AbandonableFailureStatuses.includes(ctx.childStatus))
        || isPublishFailedPair(ctx);
}

function canReject(ctx: GateContext): boolean {
    if (isAdmin(ctx)) {
        return true;
    }

    if (ctx.status == ReconstructionStatus.PeerReview) {
        return has(ctx.permissions, UserPermissions.PeerReview);
    }

    if (ctx.status == ReconstructionStatus.PublishReview || isAbandonableFailure(ctx) || isPublishFailedPair(ctx)) {
        return has(ctx.permissions, UserPermissions.PublishReview);
    }

    return false;
}

function canApprove(ctx: GateContext, targetStatus: ReconstructionStatus): boolean {
    if (isAdmin(ctx)) {
        return true;
    }

    if (ctx.status == ReconstructionStatus.PeerReview) {
        return has(ctx.permissions, UserPermissions.PeerReview);
    }

    if (targetStatus == ReconstructionStatus.Approved) {
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

export function gateFor(action: ReconstructionAction, ctx: GateContext): Gate {
    switch (action) {
        case ReconstructionAction.Discard:
            // The annotator bar never shows owner controls on someone else's reconstruction.  Elsewhere it shows to
            // anyone who could discard at some status.
            return {visible: ctx.area == "annotator" ? isOwner(ctx) : canOperatePipeline(ctx), enabled: canDiscard(ctx)};
        case ReconstructionAction.Reopen:
            return ownerGate(ctx, statusCanReopen(ctx.status));
        case ReconstructionAction.Hold:
            return ownerGate(ctx, PausableSourceStatuses.includes(ctx.status));
        case ReconstructionAction.RequestPeerReview:
        case ReconstructionAction.RequestPublishReview:
            return ownerGate(ctx, ReviewRequestSourceStatuses.includes(ctx.status));
        case ReconstructionAction.MarkUntraceable:
            return {
                visible: isOwner(ctx) || isAdmin(ctx) || has(ctx.permissions, UserPermissions.ReviewAll),
                enabled: UntraceableSourceStatuses.includes(ctx.status)
            };
        case ReconstructionAction.Reject:
            // A peer reviewer can reject at some status, so visibility does not depend on this one.
            return {visible: isAdmin(ctx) || has(ctx.permissions, UserPermissions.ReviewAll), enabled: isRejectable(ctx) && canReject(ctx)};
        case ReconstructionAction.ApprovePeer:
            return {
                visible: isAdmin(ctx) || has(ctx.permissions, UserPermissions.PeerReview),
                enabled: ctx.status == ReconstructionStatus.PeerReview && canApprove(ctx, ReconstructionStatus.PublishReview)
            };
        case ReconstructionAction.ApprovePublish:
            return {
                visible: isAdmin(ctx) || has(ctx.permissions, UserPermissions.PublishReview),
                enabled: ctx.status == ReconstructionStatus.PublishReview && ctx.childStatus == AtlasReconstructionStatus.ReadyToProcess && canApprove(ctx, ReconstructionStatus.Approved)
            };
        case ReconstructionAction.Publish:
            return {visible: canPublish(ctx), enabled: ctx.status == ReconstructionStatus.ReadyToPublish};
        case ReconstructionAction.RetryPhase:
            // The Published page retries only the one status it surfaces; a pipeline failure listed there stays the
            // Review tab's to retry.
            return {
                visible: canOperatePipeline(ctx),
                enabled: ctx.area == "published" ? isPublishFailedPair(ctx) : PhaseFailureStatuses.includes(ctx.childStatus)
            };
        case ReconstructionAction.ResetPipeline:
            return {visible: canOperatePipeline(ctx), enabled: isAbandonableFailure(ctx)};
        default:
            return hidden;
    }
}
