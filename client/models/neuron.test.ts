import {describe, expect, it} from "vitest";

import {ExportFormat} from "./neuron";

describe("ExportFormat", () => {
    it("mirrors the export service's values", () => {
        expect(ExportFormat.SWC).toBe(100);
        expect(ExportFormat.Parquet).toBe(400);
        expect(ExportFormat.legacyJSON).toBe(900);
    });
});
