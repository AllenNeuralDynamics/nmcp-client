import * as React from "react";
import {createRef} from "react";
import {describe, expect, it, vi} from "vitest";
import {act, fireEvent, screen} from "@testing-library/react";

import {renderWithProviders} from "../../test/render";
import {CandidatesTable, CandidatesTableHandle, CandidatesTableProps} from "./CandidatesTable";
import {CandidateRowHeight} from "./CandidateRow";
import {NeuronShape} from "../../models/neuron";

function neuronAt(offset: number): NeuronShape {
    return {id: `n${offset}`, label: `N${offset}`, specimen: {id: "s1", label: "S1"} as any, atlasSoma: {x: 1, y: 2, z: 3}, reconstructions: []};
}

function renderTable(props: Partial<CandidatesTableProps> = {}) {
    const ref = createRef<CandidatesTableHandle>();
    const onRangeChange = vi.fn();
    const onSelected = vi.fn();

    const result = renderWithProviders(
        <CandidatesTable ref={ref} totalCount={10000} visibleRowCount={10} rowAt={offset => offset < 30 ? neuronAt(offset) : undefined}
                         version={0} showAnnotators={false} selectedId={null} onSelected={onSelected} onRangeChange={onRangeChange} {...props}/>
    );

    const table = screen.getByRole("table");
    const container = table.parentElement as HTMLDivElement;

    return {...result, ref, onRangeChange, onSelected, table, container};
}

function dataRows(table: HTMLElement): HTMLElement[] {
    return [...table.querySelectorAll<HTMLElement>("tbody tr:not([data-placeholder]):not([data-spacer])")];
}

function spacerHeight(table: HTMLElement, key: string): string {
    return table.querySelector<HTMLElement>(`[data-spacer="${key}"]`)?.style.height;
}

describe("CandidatesTable", () => {
    it("renders only the visible rows and the overscan below them", () => {
        const {table, onRangeChange} = renderTable();

        expect(dataRows(table)).toHaveLength(20);
        expect(spacerHeight(table, "top")).toBeUndefined();
        expect(spacerHeight(table, "bottom")).toBe(`${9980 * CandidateRowHeight}px`);
        expect(onRangeChange).toHaveBeenLastCalledWith(0, 9);
    });

    it("reports the new range and renders placeholders for unbuffered rows after scrolling", () => {
        const {table, container, onRangeChange} = renderTable();

        fireEvent.scroll(container, {target: {scrollTop: CandidateRowHeight * 100}});

        expect(onRangeChange).toHaveBeenLastCalledWith(100, 109);
        expect(dataRows(table)).toHaveLength(0);
        expect(table.querySelectorAll("[data-placeholder]")).toHaveLength(30);
        expect(spacerHeight(table, "top")).toBe(`${90 * CandidateRowHeight}px`);
    });

    it("scrolls to a row only when it is out of view, centring it", () => {
        const {ref, container} = renderTable();

        fireEvent.scroll(container, {target: {scrollTop: CandidateRowHeight * 100}});

        act(() => ref.current.scrollToRow(105));

        expect(container.scrollTop).toBe(CandidateRowHeight * 100);

        act(() => ref.current.scrollToRow(5000));

        expect(container.scrollTop).toBe(CandidateRowHeight * 4996);
    });

    it("scrolls to the top", () => {
        const {ref, container, onRangeChange} = renderTable();

        fireEvent.scroll(container, {target: {scrollTop: CandidateRowHeight * 100}});

        act(() => ref.current.scrollToTop());

        expect(container.scrollTop).toBe(0);
        expect(onRangeChange).toHaveBeenLastCalledWith(0, 9);
    });

    it("highlights the selected row and selects data rows, not placeholders", () => {
        const {table, container, onSelected} = renderTable({selectedId: "n3"});

        const rows = dataRows(table);

        expect(rows[3].getAttribute("style")).toContain("table-selection");
        expect(rows[4].getAttribute("style")).not.toContain("table-selection");

        fireEvent.click(rows[4]);

        expect(onSelected).toHaveBeenCalledWith(expect.objectContaining({id: "n4"}));

        fireEvent.scroll(container, {target: {scrollTop: CandidateRowHeight * 100}});
        fireEvent.click(table.querySelector("[data-placeholder]"));

        expect(onSelected).toHaveBeenCalledTimes(1);
    });

    it("shrinks the viewport to a short candidate set", () => {
        const {container} = renderTable({totalCount: 3});

        expect(container.style.height).toBe(`${(2 + 3) * CandidateRowHeight}px`);
    });
});
