import * as React from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../../test/render";
import {NeuronListContainer} from "./NeuronListContainer";
import {QueryResponseViewModel} from "../../../viewmodel/queryResponseViewModel";
import {QueryResponseViewModelContext} from "../../../hooks/useQueryResponseViewModel";
import {ExportFormat, NeuronShape, ReconstructionSpace} from "../../../models/neuron";
import {requestExport} from "../../../services/exportService";

vi.mock("./NeuronTable", () => ({NeuronTable: () => null}));
vi.mock("../../../services/exportService", () => ({requestExport: vi.fn(async () => true)}));
vi.mock("../../common/NotificationHelper");

function makeNeuron(index: number): NeuronShape {
    return {id: `neuron-${index}`, label: `Neuron ${index}`, published: {id: `atlas-${index}`, soma: null, precomputed: {skeletonId: index}}} as unknown as NeuronShape;
}

// Every view model update() creates starts out selected.
async function openExportMenu(count: number) {
    const response = new QueryResponseViewModel();

    const neurons = Array.from({length: count}, (_, i) => makeNeuron(i + 1));

    response.update(1, neurons, neurons.length);

    const {container} = renderWithProviders(
        <QueryResponseViewModelContext.Provider value={response}>
            <NeuronListContainer maxHeight={600}/>
        </QueryResponseViewModelContext.Provider>
    );

    // The menu target is a bare icon with no accessible name.
    await userEvent.click(container.querySelector('[aria-haspopup="menu"]'));
}

describe("NeuronListContainer export menu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("lists SWC, JSON and Parquet", async () => {
        await openExportMenu(2);

        const items = within(screen.getByRole("menu")).getAllByRole("menuitem").map(i => i.textContent.trim());

        expect(items).toEqual(["Export SWC", "Export JSON", "Export Parquet"]);
    });

    it("exports the selected atlas reconstructions as Parquet", async () => {
        await openExportMenu(2);

        await userEvent.click(await screen.findByRole("menuitem", {name: "Export Parquet"}));

        expect(vi.mocked(requestExport)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(requestExport)).toHaveBeenCalledWith(["atlas-1", "atlas-2"], ExportFormat.Parquet, ReconstructionSpace.Atlas);
    });

    it("shows only the limit message over ten selected neurons", async () => {
        await openExportMenu(11);

        expect(await screen.findByText("Export is limited to 10 selected neurons at one time")).toBeInTheDocument();
        expect(screen.queryByRole("menuitem", {name: "Export Parquet"})).toBeNull();
    });
});
