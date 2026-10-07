import * as React from "react";
import {DocumentNode} from "graphql";
import {describe, expect, it, vi} from "vitest";
import {getDefaultNormalizer, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {makeReconstruction, makeUser} from "../../test/fixtures";
import {ReconstructionActions} from "./ReconstructionActions";
import {actionName, actionTooltip, ReconstructionAction} from "../../models/reconstructionAction";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {UserPermissions} from "../../graphql/user";
import {
    DISCARD_RECONSTRUCTION_MUTATION,
    MARK_DUPLICATE_MUTATION,
    MARK_INCOMPLETE_MUTATION,
    MARK_UNTRACEABLE_MUTATION,
    PAUSE_RECONSTRUCTION_MUTATION,
    RESUME_RECONSTRUCTION_MUTATION
} from "../../graphql/reconstruction";

const S = ReconstructionStatus;

const owner = makeUser(UserPermissions.AnnotateAll, "owner");

const CLOSE = "Close...";
const REQUEST_REVIEW = "Request Review...";
const PEER_REVIEW = "Peer Review...";
const PUBLISH_REVIEW = "Publish Review...";

const holdActions = [ReconstructionAction.Hold, ReconstructionAction.MarkIncomplete, ReconstructionAction.MarkDuplicate];
const terminalActions = [ReconstructionAction.Discard, ReconstructionAction.MarkUntraceable];
const closeActions = [...holdActions, ...terminalActions];

function reconstructionAt(status: ReconstructionStatus, id = "rec-9") {
    return makeReconstruction({id, status, annotatorId: owner.id});
}

function renderBar(status: ReconstructionStatus, options: { user?: ReturnType<typeof makeUser>, mocks?: any[], showRequestReviewDialog?: () => void } = {}) {
    const user = options.user ?? owner;

    return renderWithProviders(<ReconstructionActions reconstruction={reconstructionAt(status)} userId={user.id}
                                                      showRequestReviewDialog={options.showRequestReviewDialog ?? (() => {
                                                      })}/>, {user, mocks: options.mocks});
}

function menuButton(name: string) {
    return screen.queryByRole("button", {name});
}

function reopenButton() {
    return screen.queryByRole("button", {name: actionName(ReconstructionAction.Reopen)});
}

async function openMenu(name: string) {
    await userEvent.click(screen.getByRole("button", {name}));
}

function item(name: string) {
    return screen.findByRole("menuitem", {name});
}

async function chooseCloseItem(action: ReconstructionAction) {
    await openMenu(CLOSE);
    await userEvent.click(await item(actionName(action)));
}

function mock(query: DocumentNode, data: object) {
    const result = vi.fn(() => ({data}));

    return {mock: {request: {query, variables: {reconstructionId: "rec-9"}}, result}, result};
}

describe("ReconstructionActions rendering", () => {
    it("owner at InProgress: both menus render enabled, no Reopen, every Close item enabled", async () => {
        renderBar(S.InProgress);

        expect(menuButton(CLOSE)).toBeEnabled();
        expect(menuButton(REQUEST_REVIEW)).toBeEnabled();
        expect(reopenButton()).not.toBeInTheDocument();

        await openMenu(CLOSE);

        for (const action of closeActions) {
            expect(await item(actionName(action))).toBeEnabled();
        }
    });

    it("Close... lists Hold, Discard, then the remaining closes, with dividers between", async () => {
        renderBar(S.InProgress);

        await openMenu(CLOSE);
        await item(actionName(ReconstructionAction.Hold));

        const entries = Array.from(screen.getByRole("menu").querySelectorAll("[role=menuitem], .mantine-Menu-divider"))
            .map(e => e.getAttribute("role") == "menuitem" ? e.textContent : "|");

        expect(entries).toEqual([
            actionName(ReconstructionAction.Hold),
            "|",
            actionName(ReconstructionAction.Discard),
            "|",
            actionName(ReconstructionAction.MarkIncomplete),
            actionName(ReconstructionAction.MarkDuplicate),
            actionName(ReconstructionAction.MarkUntraceable)
        ]);
    });

    it("owner at InProgress: both review requests enabled", async () => {
        renderBar(S.InProgress);

        await openMenu(REQUEST_REVIEW);

        expect(await item(PEER_REVIEW)).toBeEnabled();
        expect(await item(PUBLISH_REVIEW)).toBeEnabled();
    });

    describe.each([S.OnHold, S.Incomplete, S.Duplicate])("owner at hold %s", status => {
        it("shows Reopen enabled", () => {
            renderBar(status);

            expect(reopenButton()).toBeEnabled();
        });

        it("disables the holds and leaves Discard and Untraceable enabled", async () => {
            renderBar(status);

            await openMenu(CLOSE);

            for (const action of holdActions) {
                expect(await item(actionName(action))).toBeDisabled();
            }

            for (const action of terminalActions) {
                expect(await item(actionName(action))).toBeEnabled();
            }
        });

        it("disables Request Review..., none of its items being enabled", () => {
            renderBar(status);

            expect(menuButton(REQUEST_REVIEW)).toBeDisabled();
        });
    });

    it("owner at Rejected: no Reopen, every item in both menus enabled", async () => {
        renderBar(S.Rejected);

        expect(reopenButton()).not.toBeInTheDocument();

        await openMenu(CLOSE);

        for (const action of closeActions) {
            expect(await item(actionName(action))).toBeEnabled();
        }
    });

    it("owner at Rejected: both review requests enabled", async () => {
        renderBar(S.Rejected);

        await openMenu(REQUEST_REVIEW);

        expect(await item(PEER_REVIEW)).toBeEnabled();
        expect(await item(PUBLISH_REVIEW)).toBeEnabled();
    });

    // An admin owner is the case the API would let discard at several of these.
    it.each([
        S.PeerReview, S.TeamReview, S.PublishReview, S.Approved, S.WaitingForAtlasReconstruction, S.ReadyToPublish,
        S.Publishing, S.Published, S.PublishFailed
    ])("admin owner at %s: both menus render disabled, no Reopen", status => {
        renderBar(status, {user: makeUser(UserPermissions.Admin, owner.id)});

        expect(menuButton(CLOSE)).toBeDisabled();
        expect(menuButton(REQUEST_REVIEW)).toBeDisabled();
        expect(reopenButton()).not.toBeInTheDocument();
    });

    it.each([
        ["another annotator", makeUser(UserPermissions.AnnotateAll, "other")],
        ["an annotator who also reviews", makeUser(UserPermissions.AnnotateAll | UserPermissions.ReviewAll, "reviewer")],
        ["an admin", makeUser(UserPermissions.Admin, "admin")]
    ])("%s sees no annotator controls on someone else's reconstruction", (_, user) => {
        renderBar(S.OnHold, {user});

        expect(menuButton(CLOSE)).not.toBeInTheDocument();
        expect(menuButton(REQUEST_REVIEW)).not.toBeInTheDocument();
        expect(reopenButton()).not.toBeInTheDocument();
    });

    it("renders after moving from no selection to a selection", async () => {
        const props = {
            userId: owner.id, showRequestReviewDialog: () => {
            }
        };

        const {rerender} = renderWithProviders(<ReconstructionActions reconstruction={null} {...props}/>, {user: owner});

        expect(screen.getByText("No Reconstruction Selected")).toBeInTheDocument();

        rerender(<ReconstructionActions reconstruction={reconstructionAt(S.InProgress)} {...props}/>);

        await openMenu(CLOSE);

        expect(await item(actionName(ReconstructionAction.Hold))).toBeEnabled();
    });
});

describe("ReconstructionActions Close items", () => {
    const reconstruction = {__typename: "Reconstruction", id: "rec-9"};

    it.each([
        [ReconstructionAction.Hold, PAUSE_RECONSTRUCTION_MUTATION, {pauseReconstruction: {...reconstruction, status: S.OnHold}}, "Hold Reconstruction?"],
        [ReconstructionAction.MarkIncomplete, MARK_INCOMPLETE_MUTATION, {markReconstructionIncomplete: {...reconstruction, status: S.Incomplete}}, "Mark Reconstruction Incomplete?"],
        [ReconstructionAction.MarkDuplicate, MARK_DUPLICATE_MUTATION, {markReconstructionDuplicate: {...reconstruction, status: S.Duplicate}}, "Mark Reconstruction as a Duplicate?"],
        [ReconstructionAction.Discard, DISCARD_RECONSTRUCTION_MUTATION, {discardReconstruction: reconstruction}, "Discard Reconstruction?"],
        [ReconstructionAction.MarkUntraceable, MARK_UNTRACEABLE_MUTATION, {markReconstructionUntraceable: {...reconstruction, status: S.Untraceable}}, "Mark Neuron Untraceable?"]
    ])("%s confirms, then sends its mutation", async (action, query, data, title) => {
        const {mock: m, result} = mock(query, data);

        renderBar(S.InProgress, {mocks: [m]});

        await chooseCloseItem(action);

        const dialog = screen.getByRole("dialog");

        expect(within(dialog).getByText(title)).toBeInTheDocument();
        expect(within(dialog).getByText(actionTooltip(action), {normalizer: getDefaultNormalizer({collapseWhitespace: false})})).toBeInTheDocument();
        expect(result).not.toHaveBeenCalled();

        await userEvent.click(within(dialog).getByRole("button", {name: actionName(action)}));

        await waitFor(() => expect(result).toHaveBeenCalledTimes(1));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("Cancel closes the confirmation without sending anything", async () => {
        const {mock: m, result} = mock(DISCARD_RECONSTRUCTION_MUTATION, {discardReconstruction: reconstruction});

        renderBar(S.InProgress, {mocks: [m]});

        await chooseCloseItem(ReconstructionAction.Discard);

        await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", {name: "Cancel"}));

        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

        expect(result).not.toHaveBeenCalled();
    });
});

describe("ReconstructionActions Reopen and Request Review", () => {
    it("Reopen sends resumeReconstruction without a confirmation", async () => {
        const {mock: m, result} = mock(RESUME_RECONSTRUCTION_MUTATION, {resumeReconstruction: {__typename: "Reconstruction", id: "rec-9", status: S.InProgress}});

        renderBar(S.Incomplete, {mocks: [m]});

        await userEvent.click(reopenButton());

        await waitFor(() => expect(result).toHaveBeenCalledTimes(1));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it.each([
        [PEER_REVIEW, S.PeerReview],
        [PUBLISH_REVIEW, S.PublishReview]
    ])("%s asks the page for its review dialog", async (label, target) => {
        const showRequestReviewDialog = vi.fn();

        renderBar(S.InProgress, {showRequestReviewDialog});

        await openMenu(REQUEST_REVIEW);
        await userEvent.click(await item(label));

        expect(showRequestReviewDialog).toHaveBeenCalledWith("rec-9", target);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});

describe("ReconstructionActions confirmation lifecycle", () => {
    const props = {
        userId: owner.id, showRequestReviewDialog: () => {
        }
    };

    it.each([
        ["no selection", null],
        ["another reconstruction", reconstructionAt(S.InProgress, "rec-10")]
    ])("a confirmation does not return after the selection moves to %s and back", async (_, intermediate) => {
        const {mock: m, result} = mock(DISCARD_RECONSTRUCTION_MUTATION, {discardReconstruction: {__typename: "Reconstruction", id: "rec-9"}});

        const {rerender} = renderWithProviders(<ReconstructionActions reconstruction={reconstructionAt(S.InProgress)} {...props}/>, {user: owner, mocks: [m]});

        await chooseCloseItem(ReconstructionAction.Discard);

        expect(screen.getByRole("dialog")).toBeInTheDocument();

        rerender(<ReconstructionActions reconstruction={intermediate} {...props}/>);

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

        rerender(<ReconstructionActions reconstruction={reconstructionAt(S.InProgress)} {...props}/>);

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(result).not.toHaveBeenCalled();
    });

    it("a confirmation survives a poll replacing the reconstruction", async () => {
        const {mock: m, result} = mock(DISCARD_RECONSTRUCTION_MUTATION, {discardReconstruction: {__typename: "Reconstruction", id: "rec-9"}});

        const {rerender} = renderWithProviders(<ReconstructionActions reconstruction={reconstructionAt(S.InProgress)} {...props}/>, {user: owner, mocks: [m]});

        await chooseCloseItem(ReconstructionAction.Discard);

        rerender(<ReconstructionActions reconstruction={reconstructionAt(S.InProgress)} {...props}/>);

        const dialog = screen.getByRole("dialog");

        await userEvent.click(within(dialog).getByRole("button", {name: actionName(ReconstructionAction.Discard)}));

        await waitFor(() => expect(result).toHaveBeenCalledTimes(1));
    });
});
