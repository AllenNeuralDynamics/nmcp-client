import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../../test/render";
import {makeReconstruction} from "../../../test/fixtures";
import {PublishedTable} from "./PublishedTable";
import {ReconstructionStatus} from "../../../models/reconstructionStatus";

const rows = [
    makeReconstruction({id: "rec-1", status: ReconstructionStatus.Published}),
    makeReconstruction({id: "rec-2", status: ReconstructionStatus.Published})
];

const rowOf = (label: string) => screen.getByText(label).closest("tr");

describe("PublishedTable", () => {
    it("calls onRowClick with the clicked reconstruction", async () => {
        const onRowClick = vi.fn();

        renderWithProviders(<PublishedTable reconstructions={rows} selectedId={null} onRowClick={onRowClick}/>);

        await userEvent.click(rowOf("Neuron rec-2").querySelector("td:nth-child(2)"));

        expect(onRowClick).toHaveBeenCalledWith(rows[1]);
    });

    it("marks only the selected row", () => {
        renderWithProviders(<PublishedTable reconstructions={rows} selectedId="rec-1" onRowClick={() => {
        }}/>);

        // Mantine renders bg as an inline background style, and only the selected row sets bg.
        expect(rowOf("Neuron rec-1").getAttribute("style") ?? "").toContain("background");
        expect(rowOf("Neuron rec-2").getAttribute("style") ?? "").not.toContain("background");
    });
});
