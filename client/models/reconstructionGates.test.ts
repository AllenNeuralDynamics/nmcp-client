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
    admin: makeUser(UserPermissions.Admin, "admin"),
    adminOwner: makeUser(UserPermissions.Admin, OWNER_ID)
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
        ["annotator", "owner", S.Rejected, A.Initialized, true, true],
        ["annotator", "owner", S.Publishing, A.PendingSearchIndexing, true, false],
        ["annotator", "nonOwner", S.InProgress, A.Initialized, false, false],
        // An admin could discard it, but the annotator bar never shows owner controls to a non-owner.
        ["annotator", "admin", S.InProgress, A.Initialized, false, true],
        ["review", "peer", S.PeerReview, A.Initialized, false, false],
        ["review", "admin", S.PeerReview, A.Initialized, true, true],
        ["review", "publish", S.PeerReview, A.Initialized, true, false],
        ["review", "publish", S.ReadyToPublish, A.ReadyToPublish, true, true],
        ...AbandonableFailureStatuses.map((child): Row => ["review", "publish", S.WaitingForAtlasReconstruction, child, true, true]),
        ["review", "publish", S.PublishFailed, A.FailedSearchIndexing, true, false],
        ["review", "admin", S.PublishFailed, A.FailedSearchIndexing, true, false],
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
        ["review", "peer", S.ReadyToPublish, A.ReadyToPublish, false, true],
        ["review", "publish", S.ReadyToPublish, A.ReadyToPublish, true, true],
        ...AbandonableFailureStatuses.map((child): Row => ["review", "publish", S.WaitingForAtlasReconstruction, child, true, true]),
        ["review", "publish", S.PublishFailed, A.FailedSearchIndexing, true, false],
        // The pair pitfall: an abandonable child under any other parent is not abandonable.
        ["review", "publish", S.PublishReview, A.FailedPrecomputed, true, false],
        ["review", "publish", S.Publishing, A.FailedPrecomputed, true, false],
        ["review", "admin", S.PublishFailed, A.FailedPrecomputed, true, false]
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
        ["review", "admin", S.PeerReview, A.Initialized, true, true]
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
    check(ReconstructionAction.Reopen, [
        ...statuses.map((status): Row => ["annotator", "owner", status, A.Initialized, true, status == S.OnHold]),
        ["annotator", "nonOwner", S.OnHold, A.Initialized, false, true]
    ]);
});

describe.each([ReconstructionAction.Hold, ReconstructionAction.RequestPeerReview, ReconstructionAction.RequestPublishReview])("owner action %s", action => {
    check(action, [
        ...statuses.map((status): Row => ["annotator", "owner", status, A.Initialized, true, status == S.InProgress || status == S.Rejected]),
        ["annotator", "nonOwner", S.InProgress, A.Initialized, false, true]
    ]);
});

describe("MarkUntraceable", () => {
    const sources = [S.InProgress, S.OnHold, S.Rejected];

    check(ReconstructionAction.MarkUntraceable, [
        ...statuses.map((status): Row => ["annotator", "owner", status, A.Initialized, true, sources.includes(status)]),
        ["annotator", "nonOwner", S.InProgress, A.Initialized, false, true],
        ["annotator", "peer", S.InProgress, A.Initialized, true, true],
        ["annotator", "publish", S.InProgress, A.Initialized, true, true],
        ["annotator", "admin", S.InProgress, A.Initialized, true, true]
    ]);
});

describe("TeamReview, passively", () => {
    const ownerActions = [
        ReconstructionAction.Discard,
        ReconstructionAction.Reopen,
        ReconstructionAction.Hold,
        ReconstructionAction.RequestPeerReview,
        ReconstructionAction.RequestPublishReview,
        ReconstructionAction.MarkUntraceable
    ];

    it.each(ownerActions)("a non-admin owner sees action %s rendered and disabled", action => {
        expect(gateFor(action, ctx("annotator", "owner", S.TeamReview, A.ReadyToProcess))).toEqual<Gate>({visible: true, enabled: false});
    });

    it("an admin owner can discard", () => {
        expect(gateFor(ReconstructionAction.Discard, ctx("annotator", "adminOwner", S.TeamReview, A.ReadyToProcess))).toEqual<Gate>({visible: true, enabled: true});
    });
});
