import {describe, expect, it, vi} from "vitest";
import {renderHook} from "@testing-library/react";

import {useOffsetReset} from "./useOffsetReset";

function renderReset(offset: number, totalCount: number | undefined) {
    const reset = vi.fn();

    const hook = renderHook(({offset, totalCount}) => useOffsetReset(offset, totalCount, reset), {initialProps: {offset, totalCount}});

    return {reset, ...hook};
}

describe("useOffsetReset", () => {
    it.each([[25, 25], [30, 25]])("resets offset %i with total %i", (offset, total) => {
        expect(renderReset(offset, total).reset).toHaveBeenCalledTimes(1);
    });

    it.each([
        ["inside the total", 20, 25],
        ["already on the first page", 0, 0],
        ["while the total is unknown", 40, undefined]
    ])("does nothing %s", (_, offset, total) => {
        expect(renderReset(offset, total).reset).not.toHaveBeenCalled();
    });

    it("checks again when the total later shrinks", () => {
        const {reset, rerender} = renderReset(20, 100);

        expect(reset).not.toHaveBeenCalled();

        rerender({offset: 20, totalCount: 15});

        expect(reset).toHaveBeenCalledTimes(1);
    });
});
