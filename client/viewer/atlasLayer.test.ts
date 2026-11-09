import {describe, expect, it} from "vitest";

import {AtlasLayerName, ccfMirrorTransform, createAtlasLayerSource, withDefaultStructureColors, withoutDefaultStructureColors} from "./atlasLayer";
import {mirrorCCFv3Transform} from "./neuroglancerViewerState";
import {makeConstants} from "../test/fixtures";
import {Atlas} from "../models/atlas";

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

const colorAtlas = {StructureColors: {"997": "#FFFFFF", "315": "#70FF71", "549": "#FF7080"}} as unknown as Atlas;

const stateWith = (segmentColors?: Record<string, string>) => ({
    position: [1, 2, 3],
    layers: [
        {name: AtlasLayerName, type: "segmentation", segments: ["997", "315"], ...(segmentColors ? {segmentColors} : {})},
        {name: "Full", type: "segmentation", segmentColors: {"7": "#ff0000"}}
    ]
});

describe("structure colors in a saved state", () => {
    it("drops every color that is the atlas default, whatever its case", () => {
        expect(withoutDefaultStructureColors(stateWith({"997": "#ffffff", "315": "#70ff71", "549": "#FF7080"}), colorAtlas)).toEqual(stateWith());
    });

    it("keeps changed colors and colors for structures without a default", () => {
        expect(withoutDefaultStructureColors(stateWith({"997": "#ffffff", "315": "#123456", "1": "#abcdef"}), colorAtlas))
            .toEqual(stateWith({"315": "#123456", "1": "#abcdef"}));
    });

    it("restores the defaults beneath the changed colors", () => {
        expect(withDefaultStructureColors(stateWith({"315": "#123456"}), colorAtlas))
            .toEqual(stateWith({"997": "#FFFFFF", "315": "#123456", "549": "#FF7080"}));
    });

    it("leaves the given state, other layers and atlas-less viewers alone", () => {
        const state = stateWith({"997": "#ffffff"});
        const before = structuredClone(state);

        const stripped = withoutDefaultStructureColors(state, colorAtlas);

        expect(state).toEqual(before);
        expect(stripped.layers[1]).toBe(state.layers[1]);
        expect(withoutDefaultStructureColors(state, null)).toBe(state);
        expect(withDefaultStructureColors({layers: [{name: "Full"}]}, colorAtlas)).toEqual({layers: [{name: "Full"}]});
    });
});
