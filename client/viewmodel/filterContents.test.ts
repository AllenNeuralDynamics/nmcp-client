import {describe, expect, it} from "vitest";

import {FilterContents, PredicateState, RestoreTally} from "./filterContents";
import {makeConstants, makeConstantsResponse, makeMarmosetAtlasShape} from "../test/fixtures";

const constants = makeConstants();

function state(fields: Partial<PredicateState>): PredicateState {
    return {labelsOrDois: "", tracingIdsOrDOIsExactMatch: true, neuronalStructureId: null, operatorId: null, amount: "0", arbCenter: null, arbSize: null, composition: null, ...fields};
}

function restore(fields: Partial<PredicateState>, from = constants) {
    const tally: RestoreTally = {unresolvedStructures: 0};

    const filter = FilterContents.deserialize(state(fields), from, tally);

    return {names: filter.brainAreas.map(b => b.name), unresolved: tally.unresolvedStructures};
}

describe("FilterContents structure persistence", () => {
    it("writes structure uuids and no legacy key", () => {
        const filter = new FilterContents();
        filter.brainAreas = [constants.findAtlasStructure("atlas-ccf-315")];

        const serialized = filter.serialize();

        expect(serialized.atlasStructureIds).toEqual(["atlas-ccf-315"]);
        expect("brainAreaStructureIds" in serialized).toBe(false);
    });

    it("restores new-format structures from both atlases", () => {
        expect(restore({atlasStructureIds: ["atlas-ccf-315", "atlas-marmoset-315"]}).names).toEqual(["Isocortex", "Cortex"]);
    });

    it("treats an empty new-format list as no structures, ignoring legacy ids", () => {
        expect(restore({atlasStructureIds: [], brainAreaStructureIds: [315]})).toEqual({names: [], unresolved: 0});
    });

    it("reads legacy numeric ids against the Mouse atlas", () => {
        expect(restore({brainAreaStructureIds: [315]})).toEqual({names: ["Isocortex"], unresolved: 0});
    });

    it("leaves legacy ids unresolved without a Mouse atlas, rather than reading them as marmoset", () => {
        const marmosetOnly = makeConstants(makeConstantsResponse([makeMarmosetAtlasShape()]));

        expect(restore({brainAreaStructureIds: [315]}, marmosetOnly)).toEqual({names: [], unresolved: 1});
    });

    it("tallies the ids it could not resolve", () => {
        expect(restore({atlasStructureIds: ["atlas-ccf-315", "missing"]})).toEqual({names: ["Isocortex"], unresolved: 1});
        expect(restore({atlasStructureIds: ["missing-1", "missing-2"]})).toEqual({names: [], unresolved: 2});
        expect(restore({brainAreaStructureIds: [315, 123456]})).toEqual({names: ["Isocortex"], unresolved: 1});
        expect(restore({atlasStructureIds: ["atlas-ccf-8"]}).unresolved).toBe(0);
    });

    it("round-trips structures", () => {
        const filter = new FilterContents();
        filter.brainAreas = [constants.findAtlasStructure("atlas-ccf-8"), constants.findAtlasStructure("atlas-marmoset-315")];

        expect(FilterContents.deserialize(filter.serialize(), constants).brainAreas).toEqual(filter.brainAreas);
    });
});
