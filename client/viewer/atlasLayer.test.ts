import {describe, expect, it} from "vitest";

import {AtlasLayerName, ccfMirrorTransform, createAtlasLayerSource} from "./atlasLayer";
import {mirrorCCFv3Transform} from "./neuroglancerViewerState";
import {makeConstants} from "../test/fixtures";

const constants = makeConstants();
const mouse = constants.getAtlas("atlas-ccf");
const marmoset = constants.getAtlas("atlas-marmoset");

describe("atlas layer", () => {
    it("builds the layer source from each atlas", () => {
        for (const atlas of [mouse, marmoset]) {
            const source = createAtlasLayerSource(atlas);

            expect(source.name).toBe(AtlasLayerName);
            expect(source.source).toBe(atlas.geometryUrl);
            expect(source.options.segments).toEqual([atlas.rootStructureId]);
            expect(source.options.segmentColors).toBe(atlas.StructureColors);
        }
    });

    it("mirrors only Mouse atlases", () => {
        expect(ccfMirrorTransform(mouse)).toBe(mirrorCCFv3Transform);
        expect(ccfMirrorTransform(marmoset)).toBeNull();
        expect(ccfMirrorTransform(null)).toBeNull();
    });
});
