import {describe, expect, it} from "vitest";

import {candidatePoints, toViewerPoint} from "./candidatePoints";

describe("toViewerPoint", () => {
    it.each([
        ["null", null],
        ["undefined", undefined],
        ["the origin", {x: 0, y: 0, z: 0}],
        ["a negative component", {x: 100, y: -5, z: 100}],
        ["a NaN component", {x: 100, y: NaN, z: 100}]
    ])("rejects %s", (_, location) => {
        expect(toViewerPoint(location)).toBeNull();
    });

    it("scales a set location to viewer units", () => {
        expect(toViewerPoint({x: 1200, y: 3400, z: 5600})).toEqual(Float32Array.of(120, 340, 560));
    });
});

describe("candidatePoints", () => {
    it("converts location tuples to viewer points", () => {
        expect(candidatePoints(["a"], [[1200, 3400, 5600]])).toEqual([{id: "a", point: Float32Array.of(120, 340, 560)}]);
    });

    it("skips null, unset and malformed tuples and keeps each point with its own id", () => {
        const points = candidatePoints(["a", "b", "c", "d", "e"], [null, [100, 200, 300], [0, 0, 0], [1, 2], [400, 500, 600]]);

        expect(points.map(point => point.id)).toEqual(["b", "e"]);
        expect(points[1].point).toEqual(Float32Array.of(40, 50, 60));
    });
});
