import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {getDefaultNormalizer, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {makeReconstruction, makeUser} from "../../test/fixtures";
import {ReconstructionActions} from "./ReconstructionActions";
import {actionName, actionTooltip, ReconstructionAction} from "../../models/reconstructionAction";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {UserPermissions} from "../../graphql/user";
import {DISCARD_RECONSTRUCTION_MUTATION} from "../../graphql/reconstruction";

const owner = makeUser(UserPermissions.AnnotateAll, "owner");
const other = makeUser(UserPermissions.AnnotateAll, "other");

const annotatorActions = [
    ReconstructionAction.Discard,
    ReconstructionAction.Reopen,
    ReconstructionAction.Hold,
    ReconstructionAction.RequestPeerReview,
    ReconstructionAction.RequestPublishReview,
    ReconstructionAction.MarkUntraceable
];

function button(action: ReconstructionAction) {
    return screen.queryByRole("button", {name: actionName(action)});
}

function renderBar(status: ReconstructionStatus, user = owner) {
    const reconstruction = makeReconstruction({status, annotatorId: owner.id});

    return renderWithProviders(<ReconstructionActions reconstruction={reconstruction} userId={user.id} showRequestReviewDialog={() => {
    }}/>, {user});
}

describe("ReconstructionActions", () => {
    it("owner at InProgress: all render, only Reopen disabled", () => {
        renderBar(ReconstructionStatus.InProgress);

        for (const action of annotatorActions) {
            expect(button(action)).toBeInTheDocument();
        }

        expect(button(ReconstructionAction.Reopen)).toBeDisabled();

        for (const action of annotatorActions.filter(a => a != ReconstructionAction.Reopen)) {
            expect(button(action)).toBeEnabled();
        }
    });

    it("owner at OnHold: Reopen enabled, Hold and both review requests disabled", () => {
        renderBar(ReconstructionStatus.OnHold);

        expect(button(ReconstructionAction.Reopen)).toBeEnabled();
        expect(button(ReconstructionAction.Hold)).toBeDisabled();
        expect(button(ReconstructionAction.RequestPeerReview)).toBeDisabled();
        expect(button(ReconstructionAction.RequestPublishReview)).toBeDisabled();
    });

    it("owner at Publishing: every button renders disabled", () => {
        renderBar(ReconstructionStatus.Publishing);

        for (const action of annotatorActions) {
            expect(button(action)).toBeDisabled();
        }
    });

    it("non-owner: no annotator buttons render", () => {
        renderBar(ReconstructionStatus.InProgress, other);

        for (const action of annotatorActions) {
            expect(button(action)).not.toBeInTheDocument();
        }
    });

    it("renders after moving from no selection to a selection", () => {
        const props = {userId: owner.id, showRequestReviewDialog: () => {
            }};

        const {rerender} = renderWithProviders(<ReconstructionActions reconstruction={null} {...props}/>, {user: owner});

        expect(screen.getByText("No Reconstruction Selected")).toBeInTheDocument();

        rerender(<ReconstructionActions reconstruction={makeReconstruction({status: ReconstructionStatus.InProgress, annotatorId: owner.id})} {...props}/>);

        expect(button(ReconstructionAction.Hold)).toBeEnabled();
    });

    it("Discard is the annotator's action, by name and tooltip", async () => {
        renderBar(ReconstructionStatus.InProgress);

        const discard = button(ReconstructionAction.Discard);

        expect(discard).toHaveAccessibleName(actionName(ReconstructionAction.Discard));

        await userEvent.hover(discard);

        expect(await screen.findByText(actionTooltip(ReconstructionAction.Discard), {normalizer: getDefaultNormalizer({collapseWhitespace: false})})).toBeInTheDocument();
    });

    it("Discard sends discardReconstruction with the reconstruction id", async () => {
        const reconstruction = makeReconstruction({id: "rec-9", status: ReconstructionStatus.InProgress, annotatorId: owner.id});

        const result = vi.fn(() => ({data: {discardReconstruction: {__typename: "Reconstruction", id: "rec-9"}}}));

        renderWithProviders(<ReconstructionActions reconstruction={reconstruction} userId={owner.id} showRequestReviewDialog={() => {
        }}/>, {
            user: owner,
            mocks: [{request: {query: DISCARD_RECONSTRUCTION_MUTATION, variables: {reconstructionId: "rec-9"}}, result}]
        });

        await userEvent.click(button(ReconstructionAction.Discard));

        await waitFor(() => expect(result).toHaveBeenCalledTimes(1));
    });
});
