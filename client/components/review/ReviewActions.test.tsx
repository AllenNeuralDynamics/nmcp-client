import * as React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {makeReconstruction, makeUser} from "../../test/fixtures";
import {ReviewActions} from "./ReviewActions";
import {actionName, ReconstructionAction} from "../../models/reconstructionAction";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {AtlasReconstructionStatus} from "../../models/atlasReconstructionStatus";
import {UserPermissions} from "../../graphql/user";
import {REQUEST_PRECOMPUTED_REGENERATION_MUTATION} from "../../graphql/reconstruction";
import {errorNotification} from "../common/NotificationHelper";
import {User} from "../../models/user";

vi.mock("../common/NotificationHelper");

const peer = makeUser(UserPermissions.PeerReview, "peer");
const publisher = makeUser(UserPermissions.PublishReview, "publisher");
const both = makeUser(UserPermissions.ReviewAll, "both");
const admin = makeUser(UserPermissions.Admin, "admin");

const S = ReconstructionStatus;
const A = AtlasReconstructionStatus;

function button(action: ReconstructionAction) {
    return screen.queryByRole("button", {name: actionName(action)});
}

function renderBar(user: User, status: ReconstructionStatus, childStatus: AtlasReconstructionStatus = A.Initialized) {
    return renderWithProviders(<ReviewActions reconstruction={makeReconstruction({status, childStatus, annotatorId: "annotator"})}/>, {user});
}

beforeEach(() => {
    vi.mocked(errorNotification).mockClear();
});

describe("ReviewActions visibility", () => {
    it("peer reviewer at PeerReview: Reject and Approve enabled, nothing else", () => {
        renderBar(peer, S.PeerReview);

        expect(button(ReconstructionAction.Reject)).toBeEnabled();

        // ApprovePeer and ApprovePublish share a label; only one may render.
        const approvals = screen.getAllByRole("button", {name: actionName(ReconstructionAction.ApprovePeer)});
        expect(approvals).toHaveLength(1);
        expect(approvals[0]).toBeEnabled();

        expect(button(ReconstructionAction.Publish)).not.toBeInTheDocument();
        expect(button(ReconstructionAction.Discard)).not.toBeInTheDocument();
        expect(button(ReconstructionAction.RetryPhase)).not.toBeInTheDocument();
        expect(button(ReconstructionAction.ResetPipeline)).not.toBeInTheDocument();
    });

    it.each([
        ["peer reviewer", peer],
        ["publish reviewer", publisher],
        ["peer and publish reviewer", both],
        ["admin", admin]
    ])("%s never sees Discard", (_, user) => {
        renderBar(user, S.PeerReview);

        expect(button(ReconstructionAction.Discard)).not.toBeInTheDocument();
    });

    it("publish reviewer at PublishFailed + FailedSearchIndexing: Retry and Reject enabled, no Replay", () => {
        renderBar(publisher, S.PublishFailed, A.FailedSearchIndexing);

        expect(button(ReconstructionAction.RetryPhase)).toBeEnabled();
        expect(button(ReconstructionAction.Reject)).toBeEnabled();
        expect(button(ReconstructionAction.ResetPipeline)).not.toBeInTheDocument();
    });

    it("admin at PublishFailed + FailedSearchIndexing: Replay shown, disabled", () => {
        renderBar(admin, S.PublishFailed, A.FailedSearchIndexing);

        expect(button(ReconstructionAction.ResetPipeline)).toBeDisabled();
    });
});

describe("ReviewActions approval labels", () => {
    it.each([
        ["peer reviewer", peer],
        ["publish reviewer", publisher]
    ])("%s sees a single plain Approve", (_, user) => {
        renderBar(user, S.PeerReview);

        expect(screen.getAllByRole("button", {name: "Approve"})).toHaveLength(1);
        expect(screen.queryByRole("button", {name: /Approve \(/})).not.toBeInTheDocument();
    });

    it.each([
        ["peer and publish reviewer", both],
        ["admin", admin]
    ])("%s sees Approve (Peer) and Approve (Publish)", (_, user) => {
        renderBar(user, S.PeerReview);

        expect(screen.getByRole("button", {name: "Approve (Peer)"})).toBeEnabled();
        expect(screen.getByRole("button", {name: "Approve (Publish)"})).toBeDisabled();
        expect(screen.queryByRole("button", {name: "Approve"})).not.toBeInTheDocument();
    });

    it.each([
        ["peer and publish reviewer", both],
        ["admin", admin]
    ])("%s outside PeerReview sees a single plain Approve", (_, user) => {
        renderBar(user, S.PublishReview, A.ReadyToProcess);

        const approvals = screen.getAllByRole("button", {name: "Approve"});
        expect(approvals).toHaveLength(1);
        expect(approvals[0]).toBeEnabled();
        expect(screen.queryByRole("button", {name: /Approve \(/})).not.toBeInTheDocument();
    });

    it("Approve (Peer) comes before Approve (Publish)", () => {
        renderBar(both, S.PeerReview);

        const names = screen.getAllByRole("button").map(b => b.textContent);

        expect(names.indexOf("Approve (Peer)")).toBeLessThan(names.indexOf("Approve (Publish)"));
    });
});

describe("ReviewActions ordering", () => {
    it("Publish is the rightmost button", () => {
        renderBar(admin, S.ReadyToPublish);

        const buttons = screen.getAllByRole("button");

        expect(buttons.length).toBeGreaterThan(1);
        expect(buttons[buttons.length - 1]).toHaveAccessibleName(actionName(ReconstructionAction.Publish));
    });
});

describe("ReviewActions retry", () => {
    it("at WaitingForAtlasReconstruction + FailedPrecomputed, Retry Phase sends requestPrecomputedRegeneration", async () => {
        const reconstruction = makeReconstruction({id: "rec-7", status: S.WaitingForAtlasReconstruction, childStatus: A.FailedPrecomputed});

        const result = vi.fn(() => ({
            data: {
                requestPrecomputedRegeneration: {
                    __typename: "AtlasReconstruction",
                    id: "atlas-rec-7",
                    sourceUrl: null,
                    status: A.PendingPrecomputed,
                    lengthMillimeters: 0,
                    failureReason: null,
                    failedAt: null,
                    reviewer: null
                }
            }
        }));

        renderWithProviders(<ReviewActions reconstruction={reconstruction}/>, {
            user: publisher,
            mocks: [{request: {query: REQUEST_PRECOMPUTED_REGENERATION_MUTATION, variables: {reconstructionId: "rec-7"}}, result}]
        });

        await userEvent.click(button(ReconstructionAction.RetryPhase));

        await waitFor(() => expect(result).toHaveBeenCalledTimes(1));
    });
});

describe("ReviewActions phase-failure notification", () => {
    const failed = (id: string, failedAt: number, reason: string = "r") => makeReconstruction({
        id,
        status: S.WaitingForAtlasReconstruction,
        childStatus: A.FailedPrecomputed,
        phaseFailure: {phase: A.FailedPrecomputed, reason, failedAt: failedAt as unknown as Date}
    });

    it("notifies once, with the phase label and reason", () => {
        renderWithProviders(<ReviewActions reconstruction={failed("rec-1", 1000)}/>, {user: publisher});

        expect(errorNotification).toHaveBeenCalledTimes(1);
        expect(errorNotification).toHaveBeenCalledWith("Failed Precomputed Generation", "r");
    });

    it("does not notify again for a polled copy with the same id and failedAt", () => {
        const {rerender} = renderWithProviders(<ReviewActions reconstruction={failed("rec-1", 1000)}/>, {user: publisher});

        rerender(<ReviewActions reconstruction={failed("rec-1", 1000)}/>);

        expect(errorNotification).toHaveBeenCalledTimes(1);
    });

    it("notifies again when the same reconstruction fails again", () => {
        const {rerender} = renderWithProviders(<ReviewActions reconstruction={failed("rec-1", 1000)}/>, {user: publisher});

        rerender(<ReviewActions reconstruction={failed("rec-1", 2000)}/>);

        expect(errorNotification).toHaveBeenCalledTimes(2);
    });

    it("notifies again for a different failed reconstruction", () => {
        const {rerender} = renderWithProviders(<ReviewActions reconstruction={failed("rec-1", 1000)}/>, {user: publisher});

        rerender(<ReviewActions reconstruction={failed("rec-2", 1000)}/>);

        expect(errorNotification).toHaveBeenCalledTimes(2);
    });

    it("never notifies without a phase failure", () => {
        renderBar(publisher, S.WaitingForAtlasReconstruction, A.InPrecomputed);

        expect(errorNotification).not.toHaveBeenCalled();
    });

    it("falls back to a default message when no reason was recorded", () => {
        renderWithProviders(<ReviewActions reconstruction={failed("rec-1", 1000, null)}/>, {user: publisher});

        expect(errorNotification).toHaveBeenCalledWith("Failed Precomputed Generation", "No reason was recorded.");
    });

    it("renders and notifies after moving from no selection to a failed reconstruction", () => {
        const {rerender} = renderWithProviders(<ReviewActions reconstruction={null}/>, {user: publisher});

        expect(screen.getByText("No Reconstruction Selected")).toBeInTheDocument();

        rerender(<ReviewActions reconstruction={failed("rec-1", 1000)}/>);

        expect(button(ReconstructionAction.RetryPhase)).toBeEnabled();
        expect(errorNotification).toHaveBeenCalledTimes(1);
    });
});
