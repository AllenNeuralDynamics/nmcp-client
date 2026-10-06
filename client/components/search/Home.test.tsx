import * as React from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {renderHook} from "@testing-library/react";
import {ApolloClient, ApolloProvider} from "@apollo/client";

import {Home} from "./Home";
import {renderWithProviders} from "../../test/render";
import {makeConstants} from "../../test/fixtures";
import {useUIQuery} from "../../hooks/useUIQuery";
import {useQueryResponseViewModel} from "../../hooks/useQueryResponseViewModel";
import {useSearchViewer} from "../../hooks/useSearchViewer";
import {warningNotification} from "../common/NotificationHelper";
import {UserPreferences} from "../../util/userPreferences";
import {PredicateType} from "../../viewmodel/queryPredicateKind";
import {QueryStatus} from "../../viewmodel/queryResponseViewModel";

vi.mock("./QueryPage", () => ({QueryPage: () => null}));
vi.mock("./Footer", () => ({Footer: () => null}));
vi.mock("../common/NotificationHelper");

// Home works on the module-level search singletons, so the test reaches the same instances through the hooks.
const singletons = renderHook(() => ({
    uiQuery: useUIQuery(),
    response: useQueryResponseViewModel(),
    viewerRef: useSearchViewer()
})).result.current;

singletons.uiQuery.initialize(makeConstants());

const client = {query: vi.fn()};

function predicate(atlasStructureIds: string[], option = PredicateType.AnatomicalRegion, fields: object = {}) {
    return {id: "p", index: 0, brainAreaFilterTypeOption: option, filter: {atlasStructureIds, ...fields}};
}

function setShare(predicates: object[], response: object = null, viewerState: object = null) {
    const share = {timestamp: Date.now(), version: 1, query: {predicates, limitCollections: false, collectionIds: [], atlasKindIds: ["kind-mouse"]}, response};

    const hash = viewerState ? `#!${btoa(JSON.stringify(viewerState))}` : "";

    window.history.replaceState({}, "", `/?q=${btoa(JSON.stringify(share))}${hash}`);
}

async function renderHome() {
    renderWithProviders(
        <ApolloProvider client={client as unknown as ApolloClient<object>}>
            <Home/>
        </ApolloProvider>
    );

    // Past Home's 100 ms delay before a shared query runs.
    await vi.advanceTimersByTimeAsync(150);
}

const restoredNames = () => singletons.uiQuery.predicates[0].filter.brainAreas.map(b => b.name);

describe("Home query restore", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        client.query.mockResolvedValue({data: {searchNeurons: {queryTime: 1, neurons: [], totalCount: 0}}});
        localStorage.clear();
        window.history.replaceState({}, "", "/");
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("runs a shared query whose structures all resolve", async () => {
        setShare([predicate(["atlas-ccf-315"])]);

        await renderHome();

        expect(client.query).toHaveBeenCalledTimes(1);
        expect(warningNotification).not.toHaveBeenCalled();
    });

    it("keeps the known structure of a partially restored share, warns and does not run it", async () => {
        setShare([predicate(["atlas-ccf-315", "missing"])]);

        await renderHome();

        expect(client.query).not.toHaveBeenCalled();
        expect(warningNotification).toHaveBeenCalledWith("Query Partially Restored", expect.stringMatching(/^1 atlas structure in/));
        expect(restoredNames()).toEqual(["Isocortex"]);
    });

    it("restores no structures when the only one is unknown", async () => {
        setShare([predicate(["missing"])]);

        await renderHome();

        expect(client.query).not.toHaveBeenCalled();
        expect(warningNotification).toHaveBeenCalledWith("Query Partially Restored", expect.stringMatching(/^1 atlas structure in/));
        expect(restoredNames()).toEqual([]);
    });

    it("clears earlier results and ignores the share's result state on a partial restore", async () => {
        const viewer = {updateState: vi.fn(), currentState: null};
        singletons.viewerRef.register(viewer as any);

        singletons.response.update(1, [], 3);
        expect(singletons.response.status).toBe(QueryStatus.Loaded);

        setShare([predicate(["atlas-ccf-315", "missing"])], {neurons: [{neuronId: "n1"}]}, {layers: []});

        await renderHome();

        expect(restoredNames()).toEqual(["Isocortex"]);
        expect(singletons.response.status).toBe(QueryStatus.NeverQueried);
        expect(viewer.updateState).not.toHaveBeenCalled();
        expect(client.query).not.toHaveBeenCalled();

        singletons.viewerRef.unregister();
    });

    it("runs a shared custom region predicate that retains an unknown inactive structure", async () => {
        setShare([predicate(["missing"], PredicateType.CustomRegion, {arbCenter: {x: "1", y: "2", z: "3"}, arbSize: "500"})]);

        await renderHome();

        expect(client.query).toHaveBeenCalledTimes(1);
        expect(warningNotification).not.toHaveBeenCalled();
    });

    it("warns when the last query has an unknown structure", async () => {
        UserPreferences.Instance.LastQuery = [predicate(["atlas-ccf-315", "missing"])];

        await renderHome();

        expect(warningNotification).toHaveBeenCalledWith("Query Partially Restored", expect.stringMatching(/^1 atlas structure in/));
        expect(restoredNames()).toEqual(["Isocortex"]);
        expect(client.query).not.toHaveBeenCalled();
    });
});
