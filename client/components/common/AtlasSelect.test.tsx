import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {makeConstants, makeConstantsResponse} from "../../test/fixtures";
import {AtlasSelect} from "./AtlasSelect";

describe("AtlasSelect", () => {
    it("lists the atlases by name", async () => {
        renderWithProviders(<AtlasSelect value={null}/>, {constants: makeConstants()});

        await userEvent.click(screen.getByRole("textbox"));

        expect(screen.getAllByRole("option").map(o => o.textContent)).toEqual(["Marmoset population", "CCFv3"]);
    });

    it("is disabled when there are no atlases", () => {
        renderWithProviders(<AtlasSelect value={null}/>, {constants: makeConstants(makeConstantsResponse([]))});

        const input = screen.getByRole("textbox");

        expect(input).toBeDisabled();
        expect(input).toHaveAttribute("placeholder", "No atlases defined");
    });
});
