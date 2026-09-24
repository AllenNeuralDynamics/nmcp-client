import {describe, expect, it} from "vitest";
import {act, renderHook} from "@testing-library/react";

import {usePublishedQueueState} from "./usePublishedQueueState";

function selected() {
    const hook = renderHook(() => usePublishedQueueState());

    act(() => hook.result.current.setSelectedId("rec-1"));

    expect(hook.result.current.selectedId).toBe("rec-1");

    return hook;
}

describe("usePublishedQueueState", () => {
    it("clears the selection when the status filter changes", () => {
        const {result} = selected();

        act(() => result.current.setStatusFilter("publish-failed"));

        expect(result.current.selectedId).toBeNull();
    });

    it("clears the selection when the page changes", () => {
        const {result} = selected();

        act(() => result.current.setOffset(10));

        expect(result.current.selectedId).toBeNull();
    });

    it("clears the selection when the page size changes", () => {
        const {result} = selected();

        act(() => result.current.setLimit(25));

        expect(result.current.selectedId).toBeNull();
    });

    it("replaces the selection when another row is chosen", () => {
        const {result} = selected();

        act(() => result.current.setSelectedId("rec-2"));

        expect(result.current.selectedId).toBe("rec-2");
    });
});
