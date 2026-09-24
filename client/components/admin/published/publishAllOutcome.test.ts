import {describe, expect, it} from "vitest";

import {publishAllOutcome} from "./publishAllOutcome";

describe("publishAllOutcome", () => {
    it("shown, everything back: success", () => {
        expect(publishAllOutcome("shown", 10, 10).severity).toBe("success");
    });

    it("shown, a short result: error naming both counts", () => {
        const outcome = publishAllOutcome("shown", 10, 6);

        expect(outcome.severity).toBe("error");
        expect(outcome.message).toContain("6");
        expect(outcome.message).toContain("10");
    });

    it("shown, nothing back: error", () => {
        expect(publishAllOutcome("shown", 10, 0).severity).toBe("error");
    });

    it("all, a full batch while more are waiting: success worded as a batch", () => {
        // The page may report 120 waiting; the outcome has no total to compare with, which is the point.
        const outcome = publishAllOutcome("all", 1, 50);

        expect(outcome.severity).toBe("success");
        expect(outcome.message).toContain("at most 50");
    });

    it("all, a small batch: success", () => {
        expect(publishAllOutcome("all", 1, 7).severity).toBe("success");
    });

    it("all, nothing back: info, not error", () => {
        expect(publishAllOutcome("all", 1, 0).severity).toBe("info");
    });
});
