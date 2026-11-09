import * as React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";

import {renderWithProviders} from "../../test/render";
import {makeUser} from "../../test/fixtures";
import {ReviewReconstructions} from "./ReviewReconstructions";
import {ANNOTATIONS_QUERY} from "../../graphql/annotation";
import {UserPermissions} from "../../graphql/user";
import {AnnotationStatus} from "../../models/annotationStatus";
import {PageSettingsKeys} from "../../util/pageSettings";
import {ReviewSettings} from "./reviewSettings";

// The detail tabs host neuroglancer viewers; the specimen filter has its own query.
vi.mock("./reconstruction/Selection", () => ({Selection: () => null}));
vi.mock("../common/filters/SpecimenFilter", () => ({SpecimenFilter: () => null}));

function renderPage(permissions: number, filters: object) {
    localStorage.setItem(PageSettingsKeys.review, JSON.stringify({...ReviewSettings.defaults, filters: {...ReviewSettings.defaults.filters, ...filters}}));

    const result = vi.fn((_variables: any) => ({data: {annotations: {__typename: "AnnotationQueryResponse", total: 0, offset: 0, annotations: []}}}));

    const mocks = [{request: {query: ANNOTATIONS_QUERY}, variableMatcher: () => true, maxUsageCount: 5, result}];

    renderWithProviders(<ReviewReconstructions/>, {mocks, user: makeUser(permissions)});

    return result;
}

const stored = () => JSON.parse(localStorage.getItem(PageSettingsKeys.review));

describe("ReviewReconstructions settings", () => {
    beforeEach(() => localStorage.clear());

    it("restores Approval Only for a full reviewer", async () => {
        const result = renderPage(UserPermissions.ReviewAll, {approvalOnly: true});

        await screen.findByText("There are no reviewable reconstructions.");

        expect(result).toHaveBeenCalledTimes(1);
        expect(result.mock.calls[0][0].queryArgs.statusFilters).toEqual([
            {status: AnnotationStatus.PeerReview},
            {status: AnnotationStatus.PublishReview},
            {status: AnnotationStatus.Approved},
            {status: AnnotationStatus.ReadyToPublish}
        ]);
    });

    it("ignores but keeps values a peer reviewer can't use", async () => {
        const result = renderPage(UserPermissions.PeerReview, {approvalOnly: true, statuses: {enabled: true, contents: ["publish-review"]}});

        await screen.findByText("There are no reviewable reconstructions.");

        expect(result).toHaveBeenCalledTimes(1);
        expect(result.mock.calls[0][0].queryArgs.statusFilters).toEqual([{status: AnnotationStatus.PeerReview}]);
        expect(stored().filters.approvalOnly).toBe(true);
        expect(stored().filters.statuses).toEqual({enabled: true, contents: ["publish-review"]});
    });
});
