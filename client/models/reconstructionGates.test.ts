import {describe, expect, it} from "vitest";

import {Gate, GateContext, gateFor} from "./reconstructionGates";
import {ReconstructionAction} from "./reconstructionAction";
import {ReconstructionStatus} from "./reconstructionStatus";
import {AbandonableFailureStatuses, AtlasReconstructionStatus, AutomaticPhaseInProgressStatuses, PhaseFailureStatuses} from "./atlasReconstructionStatus";
import {UserPermissions} from "../graphql/user";
import {makeUser} from "../test/fixtures";

const S = ReconstructionStatus;
const A = AtlasReconstructionStatus;

const OWNER_ID = "owner";

const roles = {
    owner: makeUser(UserPermissions.AnnotateAll, OWNER_ID),
    nonOwner: makeUser(UserPermissions.AnnotateAll, "other"),
    peer: makeUser(UserPermissions.PeerReview, "peer"),
    publish: makeUser(UserPermissions.PublishReview, "publish"),
    both: makeUser(UserPermissions.ReviewAll, "both"),
    admin: makeUser(UserPermissions.Admin, "admin"),
    adminOwner: makeUser(UserPermissions.Admin, OWNER_ID),
    reviewerOwner: makeUser(UserPermissions.AnnotateAll | UserPermissions.ReviewAll, OWNER_ID)
};

type Role = keyof typeof roles;
type Area = GateContext["area"];

type Row = [Area, Role, ReconstructionStatus, AtlasReconstructionStatus, boolean, boolean];

function ctx(area: Area, role: Role, status: ReconstructionStatus, childStatus: AtlasReconstructionStatus): GateContext {
    const user = roles[role];

    return {area, status, childStatus, permissions: user.permissions, userId: user.id, annotatorId: OWNER_ID};
}

function check(action: ReconstructionAction, rows: Row[]) {
    it.each(rows)("%s / %s / status %s / child %s → visible %s, enabled %s", (area, role, status, child, visible, enabled) => {
        expect(gateFor(action, ctx(area, role, status, child))).toEqual<Gate>({visible, enabled});
    });
}

const statuses = Object.values(ReconstructionStatus).filter((v): v is ReconstructionStatus => typeof v === "number" && v != S.Multiple);

describe("Discard", () => {
    check(ReconstructionAction.Discard, [
        ["annotator", "owner", S.InProgress, A.Initialized, true, true],
        ["annotator", "owner", S.OnHold, A.Initialized, true, true],
        ["annotator", "owner", S.Incomplete, A.Initialized, true, true],
        ["annotator", "owner", S.Duplicate, A.Initialized, true, true],
        ["annotator", "owner", S.Rejected, A.Initialized, true, true],
        ["annotator", "owner", S.Publishing, A.PendingSearchIndexing, true, false],
        ["annotator", "nonOwner", S.InProgress, A.Initialized, false, false],
        // An admin could discard it, but the annotator bar never shows owner controls to a non-owner.
        ["annotator", "admin", S.InProgress, A.Initialized, false, true],
        // Reviewers could discard at some of these, but the Review tab doesn't offer it.
        ["review", "peer", S.PeerReview, A.Initialized, false, false],
        ["review", "admin", S.PeerReview, A.Initialized, false, true],
        ["review", "publish", S.PeerReview, A.Initialized, false, false],
        ["review", "publish", S.ReadyToPublish, A.ReadyToPublish, false, true],
        ...AbandonableFailureStatuses.map((child): Row => ["review", "publish", S.WaitingForAtlasReconstruction, child, false, true]),
        ["review", "publish", S.PublishFailed, A.FailedSearchIndexing, false, false],
        ["review", "admin", S.PublishFailed, A.FailedSearchIndexing, false, false],
        ["review", "peer", S.PublishFailed, A.FailedSearchIndexing, false, false],
        ["annotator", "owner", S.PublishFailed, A.FailedSearchIndexing, true, false],
        ["annotator", "adminOwner", S.PublishFailed, A.FailedSearchIndexing, true, false]
    ]);
});

describe("RetryPhase", () => {
    check(ReconstructionAction.RetryPhase, [
        ["review", "peer", S.WaitingForAtlasReconstruction, A.FailedPrecomputed, false, true],
        ...PhaseFailureStatuses.map((child): Row => ["review", "publish", S.WaitingForAtlasReconstruction, child, true, true]),
        ["review", "publish", S.PublishFailed, A.FailedSearchIndexing, true, true],
        ...[...AutomaticPhaseInProgressStatuses, A.PendingSearchIndexing, A.InSearchIndexing]
            .map((child): Row => ["review", "publish", S.WaitingForAtlasReconstruction, child, true, false]),
        ["review", "publish", S.ReadyToPublish, A.ReadyToPublish, true, false],
        ["published", "admin", S.PublishFailed, A.FailedSearchIndexing, true, true],
        // The review area enables this; the Published page leaves it to the Review tab.
        ["published", "admin", S.WaitingForAtlasReconstruction, A.FailedPrecomputed, true, false],
        ["review", "admin", S.WaitingForAtlasReconstruction, A.FailedPrecomputed, true, true]
    ]);
});

describe("ResetPipeline", () => {
    check(ReconstructionAction.ResetPipeline, [
        // Publish reviewers could replay at some of these, but only admins are offered it.
        ["review", "peer", S.ReadyToPublish, A.ReadyToPublish, false, true],
        ["review", "publish", S.ReadyToPublish, A.ReadyToPublish, false, true],
        ...AbandonableFailureStatuses.map((child): Row => ["review", "publish", S.WaitingForAtlasReconstruction, child, false, true]),
        ["review", "publish", S.PublishFailed, A.FailedSearchIndexing, false, false],
        // The pair pitfall: an abandonable child under any other parent is not abandonable.
        ["review", "admin", S.PublishReview, A.FailedPrecomputed, true, false],
        ["review", "admin", S.Publishing, A.FailedPrecomputed, true, false],
        ["review", "admin", S.PublishFailed, A.FailedPrecomputed, true, false],
        ...AbandonableFailureStatuses.map((child): Row => ["review", "admin", S.WaitingForAtlasReconstruction, child, true, true])
    ]);
});

describe("Reject", () => {
    const rejectableByAdmin: [ReconstructionStatus, AtlasReconstructionStatus][] = [
        [S.PeerReview, A.Initialized],
        [S.TeamReview, A.Initialized],
        [S.PublishReview, A.ReadyToProcess],
        [S.ReadyToPublish, A.ReadyToPublish],
        ...AbandonableFailureStatuses.map((child): [ReconstructionStatus, AtlasReconstructionStatus] => [S.WaitingForAtlasReconstruction, child]),
        [S.PublishFailed, A.FailedSearchIndexing]
    ];

    check(ReconstructionAction.Reject, [
        ["review", "publish", S.PublishReview, A.ReadyToProcess, true, true],
        ["review", "publish", S.ReadyToPublish, A.ReadyToPublish, true, true],
        ...AbandonableFailureStatuses.map((child): Row => ["review", "publish", S.WaitingForAtlasReconstruction, child, true, true]),
        ["review", "publish", S.PublishFailed, A.FailedSearchIndexing, true, true],
        ...(["peer", "publish", "admin"] as Role[]).flatMap((role): Row[] => [
            ["review", role, S.Publishing, A.PendingSearchIndexing, true, false],
            ["review", role, S.WaitingForAtlasReconstruction, A.InPrecomputed, true, false]
        ]),
        // canReject, not isRejectable, is what refuses a peer reviewer here.
        ["review", "peer", S.PeerReview, A.Initialized, true, true],
        ["review", "peer", S.PublishReview, A.ReadyToProcess, true, false],
        ["review", "peer", S.ReadyToPublish, A.ReadyToPublish, true, false],
        ["review", "publish", S.PeerReview, A.Initialized, true, false],
        ["review", "nonOwner", S.PeerReview, A.Initialized, false, false],
        ...rejectableByAdmin.map(([status, child]): Row => ["review", "admin", status, child, true, true])
    ]);
});

describe("ApprovePeer", () => {
    check(ReconstructionAction.ApprovePeer, [
        ["review", "publish", S.PeerReview, A.Initialized, false, false],
        ...statuses.map((status): Row => ["review", "peer", status, A.Initialized, true, status == S.PeerReview]),
        // Anyone who also sees ApprovePublish sees this one only at PeerReview.
        ...statuses.map((status): Row => ["review", "both", status, A.Initialized, status == S.PeerReview, status == S.PeerReview]),
        ...statuses.map((status): Row => ["review", "admin", status, A.Initialized, status == S.PeerReview, status == S.PeerReview])
    ]);
});

describe("ApprovePublish", () => {
    check(ReconstructionAction.ApprovePublish, [
        ["review", "peer", S.PublishReview, A.ReadyToProcess, false, false],
        ["review", "publish", S.PublishReview, A.ReadyToProcess, true, true],
        ["review", "publish", S.PublishReview, A.Initialized, true, false],
        ...statuses.filter(s => s != S.PublishReview).map((status): Row => ["review", "publish", status, A.ReadyToProcess, true, false]),
        ["review", "admin", S.PublishReview, A.ReadyToProcess, true, true]
    ]);
});

describe("Publish", () => {
    check(ReconstructionAction.Publish, [
        ["review", "peer", S.ReadyToPublish, A.ReadyToPublish, false, true],
        ...statuses.map((status): Row => ["review", "publish", status, A.ReadyToPublish, true, status == S.ReadyToPublish]),
        ["review", "admin", S.ReadyToPublish, A.ReadyToPublish, true, true]
    ]);
});

describe("Reopen", () => {
    const resumable = [S.OnHold, S.Incomplete, S.Duplicate];

    check(ReconstructionAction.Reopen, [
        // Shown only while it is an option, unlike the rest of the bar.
        ...statuses.map((status): Row => ["annotator", "owner", status, A.Initialized, resumable.includes(status), resumable.includes(status)]),
        ["annotator", "nonOwner", S.OnHold, A.Initialized, false, true],
        ["annotator", "nonOwner", S.Incomplete, A.Initialized, false, true],
        ["annotator", "admin", S.Duplicate, A.Initialized, false, true],
        ["annotator", "adminOwner", S.Incomplete, A.Initialized, true, true]
    ]);
});

describe.each([
    ReconstructionAction.Hold,
    ReconstructionAction.MarkIncomplete,
    ReconstructionAction.MarkDuplicate,
    ReconstructionAction.RequestPeerReview,
    ReconstructionAction.RequestPublishReview
])("owner action %s", action => {
    check(action, [
        ...statuses.map((status): Row => ["annotator", "owner", status, A.Initialized, true, status == S.InProgress || status == S.Rejected]),
        ["annotator", "nonOwner", S.InProgress, A.Initialized, false, true]
    ]);
});

describe("MarkUntraceable", () => {
    const sources = [S.InProgress, S.OnHold, S.Incomplete, S.Duplicate, S.Rejected];

    check(ReconstructionAction.MarkUntraceable, [
        ...statuses.map((status): Row => ["annotator", "owner", status, A.Initialized, true, sources.includes(status)]),
        ["annotator", "nonOwner", S.InProgress, A.Initialized, false, true],
        // Reviewers and admins could mark it untraceable, but the annotator bar offers it only to the owner.
        ["annotator", "peer", S.InProgress, A.Initialized, false, true],
        ["annotator", "publish", S.InProgress, A.Initialized, false, true],
        ["annotator", "both", S.InProgress, A.Initialized, false, true],
        ["annotator", "admin", S.InProgress, A.Initialized, false, true],
        ["annotator", "adminOwner", S.InProgress, A.Initialized, true, true]
    ]);
});

describe("TeamReview, passively", () => {
    const ownerActions = [
        ReconstructionAction.Discard,
        ReconstructionAction.Hold,
        ReconstructionAction.MarkIncomplete,
        ReconstructionAction.MarkDuplicate,
        ReconstructionAction.RequestPeerReview,
        ReconstructionAction.RequestPublishReview,
        ReconstructionAction.MarkUntraceable
    ];

    it.each(ownerActions)("a non-admin owner sees action %s rendered and disabled", action => {
        expect(gateFor(action, ctx("annotator", "owner", S.TeamReview, A.ReadyToProcess))).toEqual<Gate>({visible: true, enabled: false});
    });

    it("a non-admin owner does not see Reopen", () => {
        expect(gateFor(ReconstructionAction.Reopen, ctx("annotator", "owner", S.TeamReview, A.ReadyToProcess))).toEqual<Gate>({visible: false, enabled: false});
    });

    it("an admin owner is not offered Discard on the Reconstructions page", () => {
        expect(gateFor(ReconstructionAction.Discard, ctx("annotator", "adminOwner", S.TeamReview, A.ReadyToProcess))).toEqual<Gate>({visible: true, enabled: false});
    });
});

describe("Close actions on the Reconstructions page", () => {
    const closeActions = [
        ReconstructionAction.Hold,
        ReconstructionAction.MarkIncomplete,
        ReconstructionAction.MarkDuplicate,
        ReconstructionAction.Discard,
        ReconstructionAction.MarkUntraceable
    ];

    const held = [S.InProgress, S.OnHold, S.Incomplete, S.Duplicate, S.Rejected];

    // Children at which the API would let an admin or publish reviewer discard, so only the page's rule disables it.
    const child = (status: ReconstructionStatus) => status == S.WaitingForAtlasReconstruction ? AbandonableFailureStatuses[0]
        : status == S.PublishFailed ? A.FailedSearchIndexing : A.ReadyToProcess;

    describe.each(closeActions)("action %s", action => {
        it.each(statuses.filter(s => !held.includes(s)).flatMap(status => (["owner", "adminOwner", "reviewerOwner"] as Role[]).map(role => [role, status] as const)))(
            "%s at status %s: disabled", (role, status) => {
                expect(gateFor(action, ctx("annotator", role, status, child(status)))).toEqual<Gate>({visible: true, enabled: false});
            });
    });

    it("leaves the Review tab's Discard as the API allows it", () => {
        expect(gateFor(ReconstructionAction.Discard, ctx("review", "adminOwner", S.PeerReview, A.Initialized)).enabled).toBe(true);
        expect(gateFor(ReconstructionAction.Discard, ctx("review", "reviewerOwner", S.ReadyToPublish, A.ReadyToPublish)).enabled).toBe(true);
    });
});
