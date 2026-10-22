import * as React from "react";
import {describe, expect, it, vi} from "vitest";
import {act, renderHook} from "@testing-library/react";

import {usePendingTableScroll} from "./usePendingTableScroll";
import {CandidatesTableHandle} from "./CandidatesTable";

type HookProps = {
    tableReady: boolean;
    totalCount: number | null;
    selectedId: string | null;
};

function setup(initial: HookProps) {
    const handle = {scrollToRow: vi.fn(), scrollToTop: vi.fn()};
    const tableRef: React.MutableRefObject<CandidatesTableHandle> = {current: null};

    const hook = renderHook((props: HookProps) => usePendingTableScroll(tableRef, props.tableReady, props.totalCount, props.selectedId), {initialProps: initial});

    const mountTable = () => tableRef.current = handle;

    return {handle, hook, mountTable};
}

describe("usePendingTableScroll", () => {
    it("waits for the table to mount, then scrolls once", () => {
        const {handle, hook, mountTable} = setup({tableReady: false, totalCount: null, selectedId: "n1"});

        act(() => hook.result.current("n1", 120));

        expect(handle.scrollToRow).not.toHaveBeenCalled();

        mountTable();
        hook.rerender({tableReady: true, totalCount: 500, selectedId: "n1"});

        expect(handle.scrollToRow).toHaveBeenCalledTimes(1);
        expect(handle.scrollToRow).toHaveBeenCalledWith(120);

        hook.rerender({tableReady: true, totalCount: 501, selectedId: "n1"});

        expect(handle.scrollToRow).toHaveBeenCalledTimes(1);
    });

    it("waits until the count can hold the row", () => {
        const {handle, hook, mountTable} = setup({tableReady: true, totalCount: 100, selectedId: "n1"});

        mountTable();
        act(() => hook.result.current("n1", 120));

        expect(handle.scrollToRow).not.toHaveBeenCalled();

        hook.rerender({tableReady: true, totalCount: 500, selectedId: "n1"});

        expect(handle.scrollToRow).toHaveBeenCalledWith(120);
    });

    it.each([["another neuron", "n2"], ["nothing", null]])("discards the target when the selection moves to %s", (_, selectedId) => {
        const {handle, hook, mountTable} = setup({tableReady: false, totalCount: null, selectedId: "n1"});

        act(() => hook.result.current("n1", 120));

        hook.rerender({tableReady: false, totalCount: null, selectedId});

        mountTable();
        hook.rerender({tableReady: true, totalCount: 500, selectedId});

        expect(handle.scrollToRow).not.toHaveBeenCalled();
    });
});
