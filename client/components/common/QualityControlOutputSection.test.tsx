import * as React from "react";
import {describe, expect, it} from "vitest";
import {screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {QualityOutput} from "../../models/qualityControl";
import {QualityControlOutputSection} from "./QualityControlOutputSection";
import {v3Data} from "../../test/qualityControlFixtures";

const newerMessage = "Quality control content is from a newer version and can't be displayed yet.";

const v2Data = {
    serviceVersion: 2,
    toolVersion: "0.5.1",
    score: 400,
    passed: [{name: "Soma Count", safeName: "SomaCount", description: "Exactly one soma", nodes: []}],
    warnings: [{name: "Short Branch", safeName: "ShortBranch", description: "Branch below minimum length", nodes: [7]}],
    errors: [{name: "Dangling Nodes", safeName: "DanglingNodes", description: "Nodes without a parent", nodes: [1, 2, 3]}]
};

function render(output: QualityOutput, leading?: React.ReactNode) {
    return renderWithProviders(<QualityControlOutputSection output={output} leading={leading}/>);
}

function expectInOrder(texts: string[]) {
    const elements = texts.map(t => screen.getByText(t));

    for (let i = 1; i < elements.length; i++) {
        expect(elements[i - 1].compareDocumentPosition(elements[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
}

async function chooseGrouping(label: string) {
    await userEvent.click(screen.getByRole("textbox", {name: "Group by"}));
    await userEvent.click(screen.getByRole("option", {name: label}));
}

function expectNoV2Content() {
    for (const text of ["Passed", "Errors", "Warnings"]) {
        expect(screen.queryByText(text)).toBeNull();
    }
    expect(screen.queryByText(/Tool Error/)).toBeNull();
}

describe("QualityControlOutputSection", () => {
    it("shows v2 test results", () => {
        render({serviceVersion: 2, toolVersion: "0.5.1", data: v2Data});

        expect(screen.getByText("Standard Morph version: 0.5.1")).toBeTruthy();
        expect(screen.getByText("Passed")).toBeTruthy();
        expect(screen.getByText("Errors")).toBeTruthy();
        expect(screen.getByText("Warnings")).toBeTruthy();
        expect(screen.getByText("Soma Count")).toBeTruthy();
        expect(screen.getByText("Short Branch")).toBeTruthy();
        expect(screen.getByText("Dangling Nodes")).toBeTruthy();
        expect(screen.getByText("3")).toBeTruthy();
        expect(screen.queryByText(/Tool Error/)).toBeNull();
        expect(screen.queryByText(newerMessage)).toBeNull();
    });

    it("shows a v2 tool error", () => {
        render({
            serviceVersion: 2,
            toolVersion: "0.5.1",
            data: {passed: [], warnings: [], errors: [], toolError: {kind: "Timeout", description: "Took too long", info: "after 600 s"}}
        });

        expect(screen.getByText("Tool Error: Timeout")).toBeTruthy();
        expect(screen.getByText("Took too long")).toBeTruthy();
        expect(screen.getByText("after 600 s")).toBeTruthy();
        for (const text of ["Passed", "Errors", "Warnings"]) {
            expect(screen.queryByText(text)).toBeNull();
        }
    });

    it("shows v1 results, which have no passed bucket", () => {
        render({
            serviceVersion: 1,
            toolVersion: "0.1.0",
            data: {
                warnings: [{name: "Short Branch", description: "Branch below minimum length", nodes: [7]}],
                errors: [{name: "Dangling Nodes", description: "Nodes without a parent", nodes: [1]}]
            }
        });

        expect(screen.getByText("Errors")).toBeTruthy();
        expect(screen.getByText("Warnings")).toBeTruthy();
        expect(screen.queryByText("Passed")).toBeNull();
    });

    it("summarizes v3 metrics by outcome and by the document's default grouping", () => {
        render({serviceVersion: 3, toolVersion: "1.0.2", data: v3Data});

        expect(screen.getByText("Standard Morph version: 1.0.2")).toBeTruthy();
        expect(screen.getByText("Passed: 2")).toBeTruthy();
        expect(screen.getByText("Failed: 1")).toBeTruthy();
        expect(screen.getByText("Warning: 1")).toBeTruthy();
        expect(screen.getByRole("row", {name: "Phase Passed Failed Warning Total"})).toBeTruthy();
        expect(screen.getByRole("row", {name: "Integrity 1 0 0 1"})).toBeTruthy();
        expect(screen.getByRole("row", {name: "Morphology 1 1 1 3"})).toBeTruthy();
        expect(screen.queryByText(newerMessage)).toBeNull();
        expect(screen.queryByText(/Service Error/)).toBeNull();
    });

    it("summarizes v3 metrics by stage when the document has no default grouping", () => {
        render({serviceVersion: 3, toolVersion: "1.0.2", data: {...v3Data, qualityControl: {...v3Data.qualityControl, default_grouping: []}}});

        expect(screen.getByRole("row", {name: "Stage Passed Failed Warning Total"})).toBeTruthy();
        expect(screen.getByRole("row", {name: "Processing 2 1 1 4"})).toBeTruthy();
    });

    it("puts the caller's status and the tool version at the left of the header row, and the controls at the right", () => {
        render({serviceVersion: 3, toolVersion: "1.0.2", data: v3Data}, <span>Overall Status</span>);

        const left = screen.getByText("Overall Status").closest(".mantine-Group-root");

        expect(left).toContainElement(screen.getByText("Standard Morph version: 1.0.2"));
        expect(left).not.toContainElement(screen.getByRole("switch", {name: "Only show failed"}));
        expect(left.parentElement).toContainElement(screen.getByRole("textbox", {name: "Group by"}));
        expectInOrder(["Overall Status", "Standard Morph version: 1.0.2", "Only show failed", "Group by", "Summary"]);
    });

    it("shows every outcome until only failed is switched on, whatever the grouping", async () => {
        render({serviceVersion: 3, toolVersion: "1.0.2", data: v3Data});

        const onlyFailed = screen.getByRole("switch", {name: "Only show failed"});

        expect(onlyFailed).not.toBeChecked();
        expect(onlyFailed).toBeEnabled();
        expect(screen.getByText("Required Columns")).toBeTruthy();

        await userEvent.click(onlyFailed);

        for (const grouping of ["Phase", "Pass/Fail", "None"]) {
            await chooseGrouping(grouping);

            expect(screen.getByText("Duplicate Node Coordinates")).toBeTruthy();
            for (const name of ["Required Columns", "Single Root Node", "Branch Max Degree"]) {
                expect(screen.queryByText(name)).toBeNull();
            }
        }

        expect(screen.getByText("Passed: 2")).toBeTruthy();
        expect(screen.queryByText("Integrity: Passed")).toBeNull();
    });

    it("disables only failed when nothing failed", () => {
        const metrics = v3Data.qualityControl.metrics.filter(m => m.name !== "duplicate_node_coordinates");

        render({serviceVersion: 3, toolVersion: "1.0.2", data: {...v3Data, qualityControl: {...v3Data.qualityControl, metrics}}});

        const onlyFailed = screen.getByRole("switch", {name: "Only show failed"});

        expect(onlyFailed).toBeDisabled();
        expect(onlyFailed).not.toBeChecked();
    });

    it("offers Pass/Fail, the document's groupings and None, starting on the document's first grouping", async () => {
        render({serviceVersion: 3, toolVersion: "1.0.2", data: v3Data});

        const select = screen.getByRole("textbox", {name: "Group by"});

        expect(select).toHaveValue("Phase");

        await userEvent.click(select);

        expect(screen.getAllByRole("option").map(o => o.textContent)).toEqual(["Pass/Fail", "Phase", "None"]);
    });

    it("groups v3 metrics by phase, failures first within each, with the document's phase status", () => {
        render({serviceVersion: 3, toolVersion: "1.0.2", data: v3Data});

        expect(screen.getByText("Integrity: Passed")).toBeTruthy();
        expect(screen.getByText("Morphology: Failed")).toBeTruthy();
        expectInOrder(["Required Columns", "Duplicate Node Coordinates", "Branch Max Degree", "Single Root Node"]);
        expect(screen.getByRole("row", {name: /^Failed Duplicate Node Coordinates/})).toHaveTextContent("phase: morphology");
    });

    it("shows v3 metrics in tables by outcome, failures first, for Pass/Fail", async () => {
        render({serviceVersion: 3, toolVersion: "1.0.2", data: v3Data});

        await chooseGrouping("Pass/Fail");

        expectInOrder(["Duplicate Node Coordinates", "Branch Max Degree", "Required Columns", "Single Root Node"]);
        expect(screen.queryByText("Morphology: Failed")).toBeNull();
        expect(screen.getByRole("row", {name: /^Duplicate Node Coordinates/})).toHaveTextContent("Processing");
        expect(screen.getByText("2 node(s) in 1 group(s) share coordinates with another node.")).toBeTruthy();
        expect(screen.getByText("Measurements: n_duplicate_groups=1")).toBeTruthy();
        expect(screen.getAllByText("phase: morphology")).toHaveLength(3);
        expect(screen.getByText("phase: integrity")).toBeTruthy();
        const cells = within(screen.getByRole("row", {name: /^Branch Max Degree/})).getAllByRole("cell").map(c => c.textContent);

        expect(cells.slice(0, 3)).toEqual(["Branch Max Degreebranch_max_degree", "0", "3"]);
    });

    it("puts every v3 metric in one table, in document order, for None", async () => {
        render({serviceVersion: 3, toolVersion: "1.0.2", data: v3Data});

        await chooseGrouping("None");

        expect(screen.getByText("All Metrics")).toBeTruthy();
        expect(screen.queryByText("Morphology: Failed")).toBeNull();
        expectInOrder(["Required Columns", "Single Root Node", "Branch Max Degree", "Duplicate Node Coordinates"]);
    });

    it("starts on Pass/Fail when the document has no default grouping", async () => {
        render({serviceVersion: 3, toolVersion: "1.0.2", data: {...v3Data, qualityControl: {...v3Data.qualityControl, default_grouping: []}}});

        const select = screen.getByRole("textbox", {name: "Group by"});

        expect(select).toHaveValue("Pass/Fail");

        await userEvent.click(select);

        expect(screen.getAllByRole("option").map(o => o.textContent)).toEqual(["Pass/Fail", "None"]);
    });

    it("shows a v3 service error", () => {
        render({
            serviceVersion: 3,
            toolVersion: "1.0.2",
            data: {...v3Data, qualityControl: null, error: {stage: "standard_morph", kind: "ToolCrash", description: "standard_morph raised", info: "exit 1"}}
        });

        expect(screen.getByText("Service Error: ToolCrash")).toBeTruthy();
        expect(screen.getByText("standard_morph raised")).toBeTruthy();
        expect(screen.getByText("Stage: standard_morph")).toBeTruthy();
        expect(screen.getByText("exit 1")).toBeTruthy();
    });

    it.each([
        [3, "2.0.0"],
        [3, "unknown"],
        [4, "1.0.2"],
        [7, "1.0.2"]
    ])("shows only the version line and a message for v%i with tool %s", (serviceVersion, toolVersion) => {
        render({serviceVersion, toolVersion, data: {...v3Data, serviceVersion, toolVersion}});

        expect(screen.getByText(`Standard Morph version: ${toolVersion}`)).toBeTruthy();
        expect(screen.getByText(newerMessage)).toBeTruthy();
        expectNoV2Content();
        expect(screen.queryByText("Duplicate Node Coordinates")).toBeNull();
    });

    it("shows an empty v2 section when data is missing", () => {
        render({serviceVersion: 2, toolVersion: "0.5.1", data: null});

        expect(screen.getByText("Standard Morph version: 0.5.1")).toBeTruthy();
        expectNoV2Content();
    });
});
