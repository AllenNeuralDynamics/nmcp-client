import {useState} from "react";
import {describe, expect, it} from "vitest";
import {act, renderHook} from "@testing-library/react";

import {usePublishedQueueState} from "./usePublishedQueueState";
import {AdminSettings} from "../adminSettings";

function selected() {
    const hook = renderHook(() => {
        const [settings, setSettings] = useState(AdminSettings.defaults.publishing);

        return usePublishedQueueState(settings, setSettings);
    });

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

    it("stores the status it changes to", () => {
        const {result} = selected();

        act(() => result.current.setStatusFilter("publish-failed"));

        expect(result.current.statusFilter).toBe("publish-failed");
    });

    it("keeps the offset when the page size changes", () => {
        const {result} = selected();

        act(() => result.current.setOffset(10));
        act(() => result.current.setSelectedId("rec-1"));
        act(() => result.current.setLimit(25));

        expect(result.current.offset).toBe(10);
        expect(result.current.limit).toBe(25);
        expect(result.current.selectedId).toBeNull();
    });

    it("replaces the selection when another row is chosen", () => {
        const {result} = selected();

        act(() => result.current.setSelectedId("rec-2"));

        expect(result.current.selectedId).toBe("rec-2");
    });
});
