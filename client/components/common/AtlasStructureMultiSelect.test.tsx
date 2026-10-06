import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {makeConstants} from "../../test/fixtures";
import {AtlasStructureMultiSelect} from "./AtlasStructureMultiSelect";

const constants = makeConstants();

const isocortex = constants.findAtlasStructure("atlas-ccf-315");
const grey = constants.findAtlasStructure("atlas-ccf-8");
const cortex = constants.findAtlasStructure("atlas-marmoset-315");

const optionNames = () => screen.getAllByRole("option").map(o => o.textContent);

describe("AtlasStructureMultiSelect", () => {
    it("offers only the structures of its atlas", async () => {
        const onSelectionChange = vi.fn();

        renderWithProviders(<AtlasStructureMultiSelect atlasId="atlas-ccf" selection={[]} onSelectionChange={onSelectionChange}/>, {constants});

        await userEvent.click(screen.getByRole("textbox"));

        expect(optionNames()).toContain("Grey");
        expect(optionNames()).toContain("Isocortex");
        expect(optionNames()).not.toContain("Cortex");

        await userEvent.click(screen.getByRole("option", {name: "Isocortex"}));

        expect(onSelectionChange).toHaveBeenCalledWith([isocortex]);
    });

    describe("with a restored mixed-atlas selection", () => {
        const renderMixed = () => {
            const onSelectionChange = vi.fn();

            const result = renderWithProviders(<AtlasStructureMultiSelect atlasId="atlas-ccf" selection={[isocortex, cortex]} onSelectionChange={onSelectionChange}/>, {constants});

            return {onSelectionChange, container: result.container};
        };

        it("labels the other atlas's structure with its atlas name and never offers it", async () => {
            const {container} = renderMixed();

            const pills = [...container.querySelectorAll(".mantine-MultiSelect-pill")].map(p => p.textContent);
            expect(pills).toEqual(["Isocortex", "Cortex (Marmoset population)"]);

            await userEvent.click(screen.getByRole("textbox"));

            expect(optionNames().some(n => n.startsWith("Cortex"))).toBe(false);
        });

        it("keeps the other atlas's structure when another is picked", async () => {
            const {onSelectionChange} = renderMixed();

            await userEvent.click(screen.getByRole("textbox"));
            await userEvent.click(screen.getByRole("option", {name: "Grey"}));

            expect(onSelectionChange).toHaveBeenCalledWith([isocortex, cortex, grey]);
        });

        it("removes the other atlas's structure from its pill", async () => {
            const {onSelectionChange, container} = renderMixed();

            const cortexPill = [...container.querySelectorAll(".mantine-MultiSelect-pill")].find(p => p.textContent.startsWith("Cortex"));

            await userEvent.click(cortexPill.querySelector("button"));

            expect(onSelectionChange).toHaveBeenCalledWith([isocortex]);
        });
    });
});
