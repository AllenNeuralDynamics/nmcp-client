import {describe, expect, it} from "vitest";

import {AtlasSelection} from "./atlasSelection";
import {makeConstants} from "../test/fixtures";

const constants = makeConstants();
const mouse = constants.getAtlas("atlas-ccf");
const marmoset = constants.getAtlas("atlas-marmoset");

describe("AtlasSelection", () => {
    it("builds a view model for the selected atlas", () => {
        const selection = new AtlasSelection();

        selection.select(mouse);

        expect(selection.atlasViewModel.atlas).toBe(mouse);
        expect(selection.atlasId).toBe("atlas-ccf");
    });

    it("keeps the view model and its state when the same atlas is selected again", () => {
        const selection = new AtlasSelection(mouse);
        const vm = selection.atlasViewModel;

        vm.toggle("atlas-ccf-315");
        selection.select(mouse);

        expect(selection.atlasViewModel).toBe(vm);
        expect(vm.displayedStructures.map(s => s.structure.structureId)).toContain(315);
    });

    it("replaces the view model for another atlas, and clears it for null", () => {
        const selection = new AtlasSelection(mouse);
        const vm = selection.atlasViewModel;

        selection.select(marmoset);
        expect(selection.atlasViewModel).not.toBe(vm);
        expect(selection.atlasId).toBe("atlas-marmoset");

        selection.select(null);
        expect(selection.atlasViewModel).toBeNull();
        expect(selection.atlasId).toBeNull();
    });
});
