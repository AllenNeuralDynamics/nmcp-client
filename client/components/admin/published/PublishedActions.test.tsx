import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../../test/render";
import {makeReconstruction, makeUser} from "../../../test/fixtures";
import {PublishedActions} from "./PublishedActions";
import {actionName, ReconstructionAction} from "../../../models/reconstructionAction";
import {ReconstructionStatus} from "../../../models/reconstructionStatus";
import {AtlasReconstructionStatus} from "../../../models/atlasReconstructionStatus";
import {UserPermissions} from "../../../graphql/user";
import {REQUEST_SEARCH_INDEXING_MUTATION} from "../../../graphql/reconstruction";

vi.mock("../../common/NotificationHelper");

const admin = makeUser(UserPermissions.Admin, "admin");

const retry = () => screen.getByRole("button", {name: actionName(ReconstructionAction.RetryPhase)});
const publishAll = () => screen.queryByRole("button", {name: "Publish All..."});

describe("PublishedActions", () => {
    it("published filter, nothing selected: Retry Phase disabled, no Publish All", () => {
        renderWithProviders(<PublishedActions reconstructions={[]} totalCount={0} statusFilter="published" selected={null}/>, {user: admin});

        expect(retry()).toBeDisabled();
        expect(publishAll()).not.toBeInTheDocument();
    });

    it("publishable filter, a ReadyToPublish row selected: Publish All renders, Retry Phase disabled", () => {
        const row = makeReconstruction({status: ReconstructionStatus.ReadyToPublish, childStatus: AtlasReconstructionStatus.ReadyToPublish});

        renderWithProviders(<PublishedActions reconstructions={[row]} totalCount={1} statusFilter="publishable" selected={row}/>, {user: admin});

        expect(publishAll()).toBeInTheDocument();
        expect(retry()).toBeDisabled();
    });

    it("publish-failed filter, a PublishFailed row selected: Retry Phase sends requestSearchIndexing", async () => {
        const row = makeReconstruction({id: "rec-5", status: ReconstructionStatus.PublishFailed, childStatus: AtlasReconstructionStatus.FailedSearchIndexing});

        const result = vi.fn(() => ({
            data: {
                requestSearchIndexing: {
                    __typename: "AtlasReconstruction",
                    id: "atlas-rec-5",
                    sourceUrl: null,
                    status: AtlasReconstructionStatus.PendingSearchIndexing,
                    lengthMillimeters: 0,
                    failureReason: null,
                    failedAt: null,
                    reviewer: null
                }
            }
        }));

        renderWithProviders(<PublishedActions reconstructions={[row]} totalCount={1} statusFilter="publish-failed" selected={row}/>, {
            user: admin,
            mocks: [{request: {query: REQUEST_SEARCH_INDEXING_MUTATION, variables: {reconstructionId: "rec-5"}}, result}]
        });

        expect(retry()).toBeEnabled();

        await userEvent.click(retry());

        await waitFor(() => expect(result).toHaveBeenCalledTimes(1));
    });

    it("finalizing filter, a failed pipeline row selected: Retry Phase disabled, the Review tab's to retry", () => {
        const row = makeReconstruction({status: ReconstructionStatus.WaitingForAtlasReconstruction, childStatus: AtlasReconstructionStatus.FailedPrecomputed});

        renderWithProviders(<PublishedActions reconstructions={[row]} totalCount={1} statusFilter="finalizing" selected={row}/>, {user: admin});

        expect(retry()).toBeDisabled();
    });
});
