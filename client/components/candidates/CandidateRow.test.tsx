import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen} from "@testing-library/react";
import {Table} from "@mantine/core";

import {renderWithProviders} from "../../test/render";
import {CandidateRow, CandidateRowHeight} from "./CandidateRow";
import {NeuronShape} from "../../models/neuron";
import {ReconstructionStatus} from "../../models/reconstructionStatus";

function neuronWith(statuses: ReconstructionStatus[], untraceable = false): NeuronShape {
    return {
        id: "n1",
        label: "N001",
        specimen: {id: "s1", label: "S1"} as any,
        atlasSoma: {x: 1, y: 2, z: 3},
        reconstructions: statuses.map((status, i) => ({id: `r${i}`, status}) as any),
        untraceable
    };
}

function renderRow(neuron: NeuronShape) {
    return renderWithProviders(
        <Table>
            <Table.Tbody>
                <CandidateRow key="row" neuron={neuron} showAnnotators={false} isSelected={false} onSelected={() => {}}/>
            </Table.Tbody>
        </Table>
    );
}

describe("CandidateRow", () => {
    it("shows no status badge for a candidate with no held reconstruction", () => {
        renderRow(neuronWith([ReconstructionStatus.InProgress]));

        expect(screen.queryByText("Duplicate")).toBeNull();
        expect(screen.queryByText("Incomplete")).toBeNull();
        expect(screen.queryByText("Untraceable")).toBeNull();
    });

    it("badges a Duplicate reconstruction", () => {
        renderRow(neuronWith([ReconstructionStatus.Duplicate]));

        expect(screen.getByText("Duplicate")).toBeTruthy();
        expect(screen.queryByText("Incomplete")).toBeNull();
    });

    it("badges an Incomplete reconstruction", () => {
        renderRow(neuronWith([ReconstructionStatus.Incomplete]));

        expect(screen.getByText("Incomplete")).toBeTruthy();
        expect(screen.queryByText("Duplicate")).toBeNull();
    });

    it("badges each held status once, alongside Untraceable", () => {
        renderRow(neuronWith([ReconstructionStatus.Incomplete, ReconstructionStatus.Duplicate, ReconstructionStatus.Incomplete], true));

        expect(screen.getAllByText("Duplicate")).toHaveLength(1);
        expect(screen.getAllByText("Incomplete")).toHaveLength(1);
        expect(screen.getByText("Untraceable")).toBeTruthy();
    });

    it("renders empty atlas soma cells for a candidate without one", () => {
        renderRow({...neuronWith([]), atlasSoma: null});

        const cells = screen.getAllByRole("cell");

        expect(cells.slice(5, 8).map(cell => cell.textContent)).toEqual(["", "", ""]);
    });

    it("keeps a stored origin soma visible", () => {
        renderRow({...neuronWith([]), atlasSoma: {x: 0, y: 0, z: 0}});

        expect(screen.getAllByRole("cell").slice(5, 8).map(cell => cell.textContent)).toEqual(["0.0", "0.0", "0.0"]);
    });

    it("renders at the fixed row height", () => {
        renderRow(neuronWith([]));

        expect(screen.getByRole("row")).toHaveStyle({height: `${CandidateRowHeight}px`});
    });
});
