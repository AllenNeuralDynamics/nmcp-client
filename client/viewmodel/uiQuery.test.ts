import {describe, expect, it, vi} from "vitest";
import {ApolloClient} from "@apollo/client";

import {UIQuery, UIQueryState} from "./uiQuery";
import {UIQueryPredicateState} from "./uiQueryPredicate";
import {PredicateType} from "./queryPredicateKind";
import {QueryResponseViewModel} from "./queryResponseViewModel";
import {makeConstants} from "../test/fixtures";

const constants = makeConstants();

function predicate(atlasStructureIds: string[], option = PredicateType.AnatomicalRegion, fields: object = {}): UIQueryPredicateState {
    return {id: "p", index: 0, brainAreaFilterTypeOption: option, filter: {atlasStructureIds, ...fields} as any};
}

function queryState(predicates: UIQueryPredicateState[], extra: Partial<UIQueryState> = {}): UIQueryState {
    return {predicates, limitCollections: false, collectionIds: [], ...extra};
}

function initialized(): UIQuery {
    const query = new UIQuery();

    query.initialize(constants);

    return query;
}

describe("UIQuery atlas kinds", () => {
    it("defaults the atlas kinds when first initialized", () => {
        const query = new UIQuery();
        expect(query.atlasKindIds).toEqual([]);

        query.initialize(constants);
        expect(query.atlasKindIds).toEqual(["kind-mouse"]);
    });

    it("does not reset the atlas kinds on a later initialize", () => {
        const query = initialized();

        query.atlasKindIds = ["kind-marmoset"];
        query.initialize(makeConstants());

        expect(query.atlasKindIds).toEqual(["kind-marmoset"]);
    });

    it("serializes the atlas kinds", () => {
        expect(initialized().serialize().atlasKindIds).toEqual(["kind-mouse"]);
    });

    it("restores the default for state without atlas kinds, and honors an explicit empty list", () => {
        const query = initialized();

        query.atlasKindIds = ["kind-marmoset"];
        query.deserialize(queryState([]));
        expect(query.atlasKindIds).toEqual(["kind-mouse"]);

        query.deserialize(queryState([], {atlasKindIds: []}));
        expect(query.atlasKindIds).toEqual([]);
    });

    it("sends the atlas kinds in the search context", async () => {
        const query = initialized();
        const client = {query: vi.fn().mockResolvedValue({data: {searchNeurons: {queryTime: 1, neurons: [], totalCount: 0}}})};

        await query.execute(new QueryResponseViewModel(), client as unknown as ApolloClient<object>);

        expect(client.query.mock.calls[0][0].variables.context.atlasKindIds).toEqual(["kind-mouse"]);
    });
});

describe("UIQuery unresolved structures", () => {
    it("returns the unresolved count summed over predicates", () => {
        const query = initialized();

        expect(query.deserialize(queryState([predicate(["atlas-ccf-315", "missing"]), predicate(["missing-2"])]))).toBe(2);
        expect(query.deserialize(queryState([predicate(["atlas-ccf-315"])]))).toBe(0);
    });

    it("returns the same count from deserializePredicates, and 0 for an empty list", () => {
        const query = initialized();

        expect(query.deserializePredicates([predicate(["missing"])])).toBe(1);
        expect(query.deserializePredicates([])).toBe(0);
    });

    it("does not count unknown structures held by custom region or id predicates", () => {
        const query = initialized();

        const custom = predicate(["atlas-ccf-315", "missing"], PredicateType.CustomRegion, {arbCenter: {x: "1", y: "2", z: "3"}, arbSize: "500"});
        const id = predicate(["missing"], PredicateType.IdOrDoi, {labelsOrDois: "N001"});

        expect(query.deserialize(queryState([custom, id]))).toBe(0);

        expect(query.predicates[0].filter.arbCenter).toEqual({x: "1", y: "2", z: "3"});
        expect(query.predicates[0].filter.brainAreas.map(b => b.name)).toEqual(["Isocortex"]);
        expect(query.predicates[1].filter.labelsOrDois).toBe("N001");
        expect(query.predicates[1].filter.brainAreas).toEqual([]);
    });
});
