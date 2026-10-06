import {describe, expect, it} from "vitest";

import {Atlas} from "./atlas";
import {makeMarmosetAtlasShape, makeMouseAtlasShape, MarmosetKind, MouseKind} from "../test/fixtures";

function loadAtlas(shape = makeMouseAtlasShape(), kind = MouseKind): Atlas {
    const atlas = new Atlas();

    atlas.load(shape, shape.atlasStructures, kind);

    return atlas;
}

describe("Atlas", () => {
    it("sorts structures by name and geometry structures by depth, then name", () => {
        const atlas = loadAtlas();

        expect(atlas.Structures.map(s => s.name)).toEqual(["Grey", "grooves", "Isocortex", "retina", "ventricles", "Whole Brain"]);
        expect(atlas.StructuresWithGeometry.map(s => s.name)).toEqual(["Whole Brain", "Grey", "grooves", "retina", "Isocortex"]);
    });

    it("finds structures by uuid and by numeric structure id", () => {
        const atlas = loadAtlas();

        expect(atlas.findStructure("atlas-ccf-315").name).toBe("Isocortex");
        expect(atlas.findStructure(315).name).toBe("Isocortex");
        expect(atlas.findStructureWithId("atlas-ccf-8").name).toBe("Grey");
        expect(atlas.findStructureWithId("missing")).toBeUndefined();
        expect(atlas.findStructures(["atlas-ccf-8", "atlas-ccf-997"]).map(s => s.name)).toEqual(["Grey", "Whole Brain"]);
    });

    it("keys structure colors by numeric id as a plain object, for geometry structures only", () => {
        const colors = loadAtlas().StructureColors;

        expect(Object.getPrototypeOf(colors)).toBe(Object.prototype);
        expect(colors["997"]).toBe("#AABBCC");
        expect(colors["73"]).toBeUndefined();
    });

    it("exposes the shape properties and the resolved kind", () => {
        const atlas = loadAtlas(makeMarmosetAtlasShape(), MarmosetKind);

        expect(atlas.id).toBe("atlas-marmoset");
        expect(atlas.name).toBe("Marmoset population");
        expect(atlas.geometryUrl).toBe("precomputed://s3://marmoset");
        expect(atlas.rootStructureId).toBe(1);
        expect(atlas.atlasKindId).toBe(MarmosetKind.id);
        expect(atlas.atlasKind).toBe(MarmosetKind);
    });

    it("walks up to the nearest structure with geometry", () => {
        const mouse = loadAtlas();
        const marmoset = loadAtlas(makeMarmosetAtlasShape(), MarmosetKind);

        const isocortex = mouse.findStructure(315);
        expect(mouse.findStructureWithGeometry(isocortex)).toBe(isocortex);

        expect(mouse.findStructureWithGeometry(mouse.findStructure(73)).structureId).toBe(997);

        expect(marmoset.findStructureWithGeometry(marmoset.findStructure(8))).toBeUndefined();
    });

    it("matches text by name, acronym and alias", () => {
        const shape = makeMouseAtlasShape();
        shape.atlasStructures = shape.atlasStructures.map(s => s.structureId === 315 ? {...s, acronym: "Isocx", aliases: ["neocortex"]} : s);

        const atlas = loadAtlas(shape);

        expect(atlas.structureMatchesText("isocort", "atlas-ccf-315")).toBe(true);
        expect(atlas.structureMatchesText("isocx", "atlas-ccf-315")).toBe(true);
        expect(atlas.structureMatchesText("neocortex", "atlas-ccf-315")).toBe(true);
        expect(atlas.structureMatchesText("grey", "atlas-ccf-315")).toBe(false);
    });
});
