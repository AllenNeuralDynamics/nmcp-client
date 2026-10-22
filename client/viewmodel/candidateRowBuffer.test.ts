import {describe, expect, it} from "vitest";

import {CandidateRowBuffer} from "./candidateRowBuffer";
import {NeuronShape} from "../models/neuron";

function rows(start: number, count: number): NeuronShape[] {
    return Array.from({length: count}, (_, idx) => ({id: `n${start + idx}`}));
}

function idsAt(buffer: CandidateRowBuffer, offsets: number[]): string[] {
    return offsets.map(offset => buffer.get(offset)?.id);
}

describe("CandidateRowBuffer", () => {
    it("stores rows by offset and finds them by id", () => {
        const buffer = new CandidateRowBuffer(10, 100);

        buffer.store(20, rows(20, 10));

        expect(buffer.size).toBe(10);
        expect(buffer.get(25)?.id).toBe("n25");
        expect(buffer.get(30)).toBeUndefined();
        expect(buffer.indexOf("n27")).toBe(27);
        expect(buffer.indexOf("n99")).toBeUndefined();
    });

    it("judges block completeness against the count", () => {
        const buffer = new CandidateRowBuffer(10, 100);

        buffer.store(0, rows(0, 10));
        expect(buffer.isBlockComplete(0, 100)).toBe(true);

        buffer.store(10, rows(10, 5));
        buffer.store(16, rows(16, 4));
        expect(buffer.isBlockComplete(1, 100)).toBe(false);

        buffer.store(20, rows(20, 3));
        expect(buffer.isBlockComplete(2, 23)).toBe(true);
        expect(buffer.isBlockComplete(2, null)).toBe(false);
    });

    it("shifts later rows down one when a row is removed", () => {
        const buffer = new CandidateRowBuffer(10, 100);

        buffer.store(0, rows(0, 20));

        expect(buffer.remove("n5")).toBe(true);

        expect(idsAt(buffer, [0, 4])).toEqual(["n0", "n4"]);
        expect(idsAt(buffer, [5, 6, 18])).toEqual(["n6", "n7", "n19"]);
        expect(buffer.get(19)).toBeUndefined();
        expect(buffer.indexOf("n5")).toBeUndefined();
        expect(buffer.isBlockComplete(1, 99)).toBe(false);
    });

    it("leaves the buffer alone when removing an unknown id", () => {
        const buffer = new CandidateRowBuffer(10, 100);

        buffer.store(0, rows(0, 10));

        expect(buffer.remove("missing")).toBe(false);
        expect(buffer.size).toBe(10);
        expect(buffer.get(9)?.id).toBe("n9");
    });

    it("evicts least recently used unprotected blocks down to the limit", () => {
        const buffer = new CandidateRowBuffer(10, 100);

        for (let block = 0; block < 15; block++) {
            buffer.store(block * 10, rows(block * 10, 10));
        }

        buffer.touch([3]);

        buffer.evict(new Set([0]));

        expect(buffer.size).toBe(100);
        expect(buffer.get(0)?.id).toBe("n0");
        expect(buffer.get(30)?.id).toBe("n30");
        expect(buffer.get(10)).toBeUndefined();
        expect(buffer.get(140)?.id).toBe("n140");
    });

    it("stops above the limit when only protected blocks remain", () => {
        const buffer = new CandidateRowBuffer(10, 10);

        buffer.store(0, rows(0, 10));
        buffer.store(10, rows(10, 10));

        buffer.evict(new Set([0, 1]));

        expect(buffer.size).toBe(20);
    });

    it("keeps a block just stored into a full buffer", () => {
        const buffer = new CandidateRowBuffer(10, 30);

        buffer.store(0, rows(0, 10));
        buffer.store(10, rows(10, 10));
        buffer.store(20, rows(20, 10));
        buffer.store(500, rows(500, 10));

        buffer.evict(new Set());

        expect(buffer.get(500)?.id).toBe("n500");
        expect(buffer.get(0)).toBeUndefined();
    });

    it("clears", () => {
        const buffer = new CandidateRowBuffer(10, 100);

        buffer.store(0, rows(0, 10));
        buffer.clear();

        expect(buffer.size).toBe(0);
    });
});
