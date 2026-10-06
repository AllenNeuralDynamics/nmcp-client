import {describe, expect, it} from "vitest";

import {AtlasViewModel} from "./atlasViewModel";
import {makeConstants} from "../test/fixtures";

const constants = makeConstants();

const mouse = () => new AtlasViewModel(constants.getAtlas("atlas-ccf"));
const marmoset = () => new AtlasViewModel(constants.getAtlas("atlas-marmoset"));

const childIds = (vm: AtlasViewModel, structureId: number) => vm.structures.find(s => s.structure.structureId === structureId).children.map(c => c.structure.structureId);

describe("AtlasViewModel", () => {
    it("builds the mouse tree from the root, skipping exclusions and structures without geometry", () => {
        const vm = mouse();

        expect(vm.rootStructure.structure.structureId).toBe(997);
        expect(vm.rootStructure.isDisplayed).toBe(true);
        expect(vm.rootStructure.shouldShowChildren).toBe(true);
        expect(childIds(vm, 997)).toEqual([8]);
        expect(childIds(vm, 8)).toEqual([315]);

        const ids = vm.structures.map(s => s.structure.structureId);
        expect(ids).not.toContain(304325711);
        expect(ids).not.toContain(1024);
        expect(ids).not.toContain(73);
    });

    it("roots the marmoset tree at a root without geometry", () => {
        const vm = marmoset();

        expect(vm.rootStructure.structure.structureId).toBe(1);
        expect(vm.rootStructure.shouldShowChildren).toBe(true);
        expect(vm.rootStructure.isDisplayed).toBe(false);
        expect(vm.displayedStructures).toEqual([]);

        expect(childIds(vm, 1)).toContain(315);
        expect(vm.structures.map(s => s.structure.structureId)).toContain(304325711);
    });

    it("ignores toggling a root without geometry, and clear leaves nothing displayed", () => {
        const vm = marmoset();

        vm.toggle("atlas-marmoset-1");
        expect(vm.rootStructure.isDisplayed).toBe(false);

        vm.toggle("atlas-marmoset-315");
        vm.clear();
        expect(vm.displayedStructures).toEqual([]);
    });

    it("ignores an unknown id, and clear leaves only the root displayed", () => {
        const vm = mouse();

        expect(() => vm.toggle("missing")).not.toThrow();

        vm.toggle("atlas-ccf-315");
        vm.clear();

        expect(vm.displayedStructures.map(s => s.structure.structureId)).toEqual([997]);
    });

    it("adds a structure toggled on to the history", () => {
        const vm = mouse();

        vm.toggle("atlas-ccf-315");

        expect(vm.structureHistory.map(s => s.structure.structureId)).toEqual([315]);
    });
});
