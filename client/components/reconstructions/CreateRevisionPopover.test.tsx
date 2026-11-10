import * as React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {GraphQLError} from "graphql";

import {renderWithProviders} from "../../test/render";
import {CreateRevisionPopover} from "./CreateRevisionPopover";
import {OPEN_ANNOTATION_REVISION_MUTATION} from "../../graphql/annotation";
import {ReconstructionRevisionKind} from "../../models/annotation";
import {AnnotationStatus} from "../../models/annotationStatus";
import {errorNotification} from "../common/NotificationHelper";

vi.mock("../common/NotificationHelper");

const request = {query: OPEN_ANNOTATION_REVISION_MUTATION, variables: {annotationId: "rec-9", revisionKind: ReconstructionRevisionKind.SpecimenSpace}};

const revision = {__typename: "Annotation", id: "rec-new", status: AnnotationStatus.InProgress};

async function createRevision(mock: object, onCreated?: (revision: unknown) => void) {
    renderWithProviders(<CreateRevisionPopover id="rec-9" onCreated={onCreated}/>, {mocks: [{request, ...mock}]});

    await userEvent.click(screen.getByRole("button", {name: "Create Revision"}));
    await userEvent.click(await screen.findByRole("textbox", {name: "Type of revision"}));
    await userEvent.click(await screen.findByRole("option", {name: "Specimen-Space"}));
    await userEvent.click(screen.getByRole("button", {name: "Create"}));
}

describe("CreateRevisionPopover", () => {
    beforeEach(() => vi.mocked(errorNotification).mockClear());

    it("passes the new revision to onCreated", async () => {
        const onCreated = vi.fn();

        await createRevision({result: {data: {openAnnotationRevision: revision}}}, onCreated);

        await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));

        expect(onCreated.mock.calls[0][0]).toMatchObject({id: "rec-new"});
        expect(errorNotification).not.toHaveBeenCalled();
    });

    it("closes quietly on success without onCreated, as in the Manage Neurons table", async () => {
        await createRevision({result: {data: {openAnnotationRevision: revision}}});

        await waitFor(() => expect(screen.queryByRole("button", {name: "Create"})).not.toBeInTheDocument());

        expect(errorNotification).not.toHaveBeenCalled();
    });

    it("reports a revision the API declined and does not call onCreated", async () => {
        const onCreated = vi.fn();

        await createRevision({result: {data: {openAnnotationRevision: null}}}, onCreated);

        await waitFor(() => expect(errorNotification).toHaveBeenCalledTimes(1));

        expect(vi.mocked(errorNotification).mock.calls[0][0]).toBe("Revision not Opened");
        expect(onCreated).not.toHaveBeenCalled();
    });

    it("reports an API error and does not call onCreated", async () => {
        const onCreated = vi.fn();

        await createRevision({result: {errors: [new GraphQLError("not allowed")]}}, onCreated);

        await waitFor(() => expect(errorNotification).toHaveBeenCalledWith("Error Creating Revision", "not allowed"));

        expect(onCreated).not.toHaveBeenCalled();
    });
});
