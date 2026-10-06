import {describe, expect, it} from "vitest";

import {CandidateFilter} from "./candidateFilter";
import {makeConstants} from "../test/fixtures";

const isocortex = makeConstants().findAtlasStructure("atlas-ccf-315");

describe("CandidateFilter selected atlas", () => {
    it("starts with the atlas it is given", () => {
        expect(new CandidateFilter("atlas-ccf").atlasId).toBe("atlas-ccf");
    });

    it("clears the structure filter only when the atlas changes", () => {
        const filter = new CandidateFilter("atlas-ccf");
        filter.atlasStructureFilter.contents = [isocortex];

        filter.selectAtlas("atlas-ccf");
        expect(filter.atlasStructureFilter.contents).toEqual([isocortex]);

        filter.selectAtlas("atlas-marmoset");
        expect(filter.atlasId).toBe("atlas-marmoset");
        expect(filter.atlasStructureFilter.contents).toEqual([]);
    });
});
