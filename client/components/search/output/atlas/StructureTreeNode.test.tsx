import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";

import {renderWithProviders} from "../../../../test/render";
import {makeConstants} from "../../../../test/fixtures";
import {AtlasViewModel} from "../../../../viewmodel/atlasViewModel";
import {StructureTree} from "./StructureTreeNode";

describe("StructureTree", () => {
    it("shows each view model's own tree", () => {
        const constants = makeConstants();

        renderWithProviders(
            <>
                <StructureTree atlas={new AtlasViewModel(constants.getAtlas("atlas-ccf"))}/>
                <StructureTree atlas={new AtlasViewModel(constants.getAtlas("atlas-marmoset"))}/>
            </>
        );

        expect(screen.getByText("Whole Brain")).toBeInTheDocument();
        expect(screen.getByText("WHOLE BRAIN")).toBeInTheDocument();
    });
});
