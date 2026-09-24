import * as React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {getDefaultNormalizer, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {makeReconstruction, makeUser} from "../../test/fixtures";
import {ReviewActions} from "./ReviewActions";
import {actionName, actionTooltip, ReconstructionAction} from "../../models/reconstructionAction";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {AtlasReconstructionStatus} from "../../models/atlasReconstructionStatus";
import {UserPermissions} from "../../graphql/user";
import {REQUEST_PRECOMPUTED_REGENERATION_MUTATION} from "../../graphql/reconstruction";
import {errorNotification} from "../common/NotificationHelper";
import {User} from "../../models/user";

vi.mock("../common/NotificationHelper");

const peer = makeUser(UserPermissions.PeerReview, "peer");
const publisher = makeUser(UserPermissions.PublishReview, "publisher");
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

    it("admin at PeerReview: Discard enabled", () => {
        renderBar(admin, S.PeerReview);

        expect(button(ReconstructionAction.Discard)).toBeEnabled();
    });

    it("publish reviewer at PeerReview: Discard disabled", () => {
        renderBar(publisher, S.PeerReview);

        expect(button(ReconstructionAction.Discard)).toBeDisabled();
    });

    it("publish reviewer at PublishFailed + FailedSearchIndexing: Retry and Reject enabled, Replay and Discard disabled", () => {
        renderBar(publisher, S.PublishFailed, A.FailedSearchIndexing);

        expect(button(ReconstructionAction.RetryPhase)).toBeEnabled();
        expect(button(ReconstructionAction.Reject)).toBeEnabled();
        expect(button(ReconstructionAction.ResetPipeline)).toBeDisabled();
        expect(button(ReconstructionAction.Discard)).toBeDisabled();
    });

    it("Discard is the annotator's action, by name and tooltip", async () => {
        renderBar(admin, S.PeerReview);

        const discard = button(ReconstructionAction.Discard);

        expect(discard).toHaveAccessibleName(actionName(ReconstructionAction.Discard));

        await userEvent.hover(discard);

        expect(await screen.findByText(actionTooltip(ReconstructionAction.Discard), {normalizer: getDefaultNormalizer({collapseWhitespace: false})})).toBeInTheDocument();
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
