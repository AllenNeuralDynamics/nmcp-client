import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../../test/render";
import {makeReconstruction} from "../../../test/fixtures";
import {PublishAllModal} from "./PublishAllModal";
import {publishAllOutcome} from "./publishAllOutcome";
import {ReconstructionStatus} from "../../../models/reconstructionStatus";
import {AtlasReconstructionStatus} from "../../../models/atlasReconstructionStatus";
import {PUBLISH_ALL_RECONSTRUCTION_MUTATION} from "../../../graphql/reconstruction";
import {successNotification} from "../../common/NotificationHelper";

vi.mock("../../common/NotificationHelper");

describe("PublishAllModal", () => {
    it("locks the choice while pending and reports a Shown request as Shown", async () => {
        const shown = ["rec-1", "rec-2"].map(id => makeReconstruction({id, status: ReconstructionStatus.ReadyToPublish}));

        const published = shown.map(r => ({
            __typename: "Reconstruction",
            id: r.id,
            status: ReconstructionStatus.Publishing,
            atlasReconstruction: {__typename: "AtlasReconstruction", id: `atlas-${r.id}`, status: AtlasReconstructionStatus.PendingSearchIndexing}
        }));

        const onClose = vi.fn();

        renderWithProviders(<PublishAllModal open={true} reconstructions={shown} totalCount={10} onClose={onClose}/>, {
            mocks: [{
                request: {query: PUBLISH_ALL_RECONSTRUCTION_MUTATION, variables: {reconstructionIds: ["rec-1", "rec-2"]}},
                result: {data: {publishAll: published}},
                delay: 100
            }]
        });

        const shownRadio = screen.getByRole("radio", {name: "Shown (2)"});
        const allRadio = screen.getByRole("radio", {name: /^All/});

        await userEvent.click(shownRadio);
        await userEvent.click(screen.getByRole("button", {name: "Publish"}));

        await waitFor(() => expect(allRadio).toBeDisabled());
        expect(shownRadio).toBeDisabled();

        await userEvent.click(allRadio);
        expect(allRadio).not.toBeChecked();
        expect(shownRadio).toBeChecked();

        const expected = publishAllOutcome("shown", 2, 2);

        await waitFor(() => expect(successNotification).toHaveBeenCalledWith(expected.title, expected.message));
        expect(onClose).toHaveBeenCalled();
    });
});
