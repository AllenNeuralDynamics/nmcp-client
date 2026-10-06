import {describe, expect, it} from "vitest";

import {makeConstants, makeConstantsResponse, makeMarmosetAtlasShape, MarmosetKind, MouseKind} from "../test/fixtures";

describe("DataConstants atlases", () => {
    it("keeps atlases in response order and loads the kinds", () => {
        const constants = makeConstants();

        expect(constants.Atlases.map(a => a.id)).toEqual(["atlas-marmoset", "atlas-ccf"]);
        expect(constants.AtlasKinds).toEqual([MouseKind, MarmosetKind]);
    });

    it("finds atlases and kinds by id", () => {
        const constants = makeConstants();

        expect(constants.getAtlas("atlas-ccf").name).toBe("CCFv3");
        expect(constants.getAtlas("missing")).toBeUndefined();
        expect(constants.getAtlasKind("kind-marmoset")).toBe(MarmosetKind);
        expect(constants.getAtlasKind("missing")).toBeUndefined();
    });

    it("resolves each atlas's kind from its atlasKindId", () => {
        const constants = makeConstants();

        expect(constants.getAtlas("atlas-ccf").atlasKind).toBe(MouseKind);
        expect(constants.getAtlas("atlas-marmoset").atlasKind).toBe(MarmosetKind);
    });

    it("finds structures across atlases by uuid, even where numeric ids collide", () => {
        const constants = makeConstants();

        expect(constants.findAtlasStructure("atlas-ccf-315").name).toBe("Isocortex");
        expect(constants.findAtlasStructure("atlas-marmoset-315").name).toBe("Cortex");
        expect(constants.findAtlasStructure(null)).toBeUndefined();
    });

    it("defaults to the first Mouse atlas, with no fallback to another kind", () => {
        expect(makeConstants().DefaultAtlas.id).toBe("atlas-ccf");
        expect(makeConstants(makeConstantsResponse([makeMarmosetAtlasShape()])).DefaultAtlas).toBeUndefined();
        expect(makeConstants(makeConstantsResponse([])).DefaultAtlas).toBeUndefined();
    });

    it("defaults to the Mouse kind", () => {
        expect(makeConstants().DefaultAtlasKind).toBe(MouseKind);

        const response = makeConstantsResponse();
        response.atlasKinds = [MarmosetKind];

        expect(makeConstants(response).DefaultAtlasKind).toBeUndefined();
    });
});
