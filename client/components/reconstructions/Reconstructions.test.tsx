import * as React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {makeUser} from "../../test/fixtures";
import {Reconstructions} from "./Reconstructions";
import {ANNOTATIONS_QUERY} from "../../graphql/annotation";
import {UserPermissions} from "../../graphql/user";
import {AnnotationStatus} from "../../models/annotationStatus";
import {PageSettingsKeys} from "../../util/pageSettings";
import {ReconstructionsSettings} from "./reconstructionsSettings";

// The preview hosts a three.js viewer and imports client/index.tsx; the specimen filter has its own query.
vi.mock("../common/ReconstructionFilePreview", () => ({ReconstructionFilePreview: () => null}));
vi.mock("../common/filters/SpecimenFilter", () => ({SpecimenFilter: () => null}));

const storedEntry = {
    version: 1,
    filters: {
        userOnly: true,
        specimens: {enabled: true, contents: ["sp-1"]},
        statuses: {enabled: true, contents: [AnnotationStatus.InProgress]}
    },
    pagination: {offset: 20, limit: 20},
    selectedId: "rec-9"
};

function renderPage(total: number) {
    localStorage.setItem(PageSettingsKeys.reconstructions, JSON.stringify(storedEntry));

    const result = vi.fn((_variables: any) => ({data: {annotations: {__typename: "AnnotationQueryResponse", total, offset: 0, annotations: []}}}));

    const mocks = [{request: {query: ANNOTATIONS_QUERY}, variableMatcher: () => true, maxUsageCount: 5, result}];

    renderWithProviders(<Reconstructions/>, {mocks, user: makeUser(UserPermissions.AnnotateAll)});

    return result;
}

const stored = () => JSON.parse(localStorage.getItem(PageSettingsKeys.reconstructions));

describe("Reconstructions settings", () => {
    beforeEach(() => localStorage.clear());

    it("queries once, with the restored settings", async () => {
        const result = renderPage(100);

        await screen.findByRole("button", {name: "Reset filters"});

        expect(result).toHaveBeenCalledTimes(1);
        expect(result.mock.calls[0][0]).toEqual({
            queryArgs: {offset: 20, limit: 20, userOnly: true, status: [AnnotationStatus.InProgress], specimenIds: ["sp-1"]},
            includeRaw: true
        });
    });

    it("returns to the first page when the offset is past the end", async () => {
        const result = renderPage(15);

        await waitFor(() => expect(result).toHaveBeenCalledTimes(2));

        expect(result.mock.calls[1][0].queryArgs.offset).toBe(0);
        expect(stored().pagination.offset).toBe(0);
    });

    it("resets the filters and page but keeps the page size and selection", async () => {
        renderPage(100);

        await userEvent.click(await screen.findByRole("button", {name: "Reset filters"}));

        expect(stored().filters).toEqual(ReconstructionsSettings.defaults.filters);
        expect(stored().pagination).toEqual({offset: 0, limit: 20});
        expect(stored().selectedId).toBe("rec-9");
    });

    it("keeps the offset when the page size changes", async () => {
        renderPage(100);

        const slider = await screen.findByRole("slider");

        slider.focus();
        await userEvent.keyboard("{ArrowRight}");

        await waitFor(() => expect(stored().pagination).toEqual({offset: 20, limit: 25}));
    });
});
