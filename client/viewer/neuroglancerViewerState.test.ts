import {describe, expect, it} from "vitest";

import {immutableDefaultState, mirrorCCFv3Transform, withDimensions} from "./neuroglancerViewerState";

const current = immutableDefaultState.dimensions;

const tenMicron = {x: [0.00001, "m"], y: [0.00001, "m"], z: [0.00001, "m"]};

function expectClose(actual: number[], expected: number[]) {
    expect(actual).toHaveLength(expected.length);
    expected.forEach((value, i) => expect(actual[i]).toBeCloseTo(value));
}

describe("withDimensions", () => {
    it("returns a state already in the given dimensions unchanged", () => {
        const state = {dimensions: current, position: [1, 2, 3]};

        expect(withDimensions(state, current)).toBe(state);
    });

    it("returns a state without dimensions unchanged", () => {
        const state = {position: [1, 2, 3]};

        expect(withDimensions(state, current)).toBe(state);
        expect(withDimensions(null, current)).toBeNull();
    });

    it("rescales the position, zooms and depths of a state saved in other dimensions", () => {
        const state = {
            dimensions: tenMicron,
            position: [659.5, 399.5, 569.5],
            crossSectionScale: 2,
            projectionScale: 1536,
            projectionDepth: -12,
            layout: "3d"
        };

        const result = withDimensions(state, current);

        expect(result.dimensions).toEqual(current);
        expect(result.position[0]).toBeCloseTo(65950);
        expect(result.position[1]).toBeCloseTo(39950);
        expect(result.position[2]).toBeCloseTo(56950);
        expect(result.crossSectionScale).toBeCloseTo(200);
        expect(result.projectionScale).toBeCloseTo(153600);
        expect(result.projectionDepth).toBeCloseTo(-1200);
        expect(result.layout).toBe("3d");
        expect(state.position).toEqual([659.5, 399.5, 569.5]);
    });

    it("rescales points only in local annotation layers that follow the global dimensions", () => {
        const annotations = [{type: "point", id: "a", point: [1, 2, 3]}];
        const ownTransform = {url: "local://annotations", transform: {outputDimensions: tenMicron}};
        const mirror = {url: "precomputed://somewhere/full", transform: mirrorCCFv3Transform};

        const result = withDimensions({
            dimensions: tenMicron,
            layers: [
                {name: "plain", type: "annotation", source: "local://annotations", annotations},
                {name: "object", type: "annotation", source: {url: "local://annotations"}, annotations},
                {name: "own", type: "annotation", source: ownTransform, annotations},
                {name: "mirror", type: "segmentation", source: mirror}
            ]
        }, current);

        const points = (name: string) => result.layers.find((l: any) => l.name === name).annotations[0].point;

        expectClose(points("plain"), [100, 200, 300]);
        expectClose(points("object"), [100, 200, 300]);
        expect(points("own")).toEqual([1, 2, 3]);
        expect(result.layers[3].source).toBe(mirror);
    });

    it("keeps dimensions it has no target for, or whose units differ", () => {
        const result = withDimensions({
            dimensions: {...tenMicron, t: [1, "s"], z: [1, "s"]},
            position: [1, 1, 1, 1]
        }, current);

        expect(result.dimensions.t).toEqual([1, "s"]);
        expect(result.dimensions.z).toEqual([1, "s"]);
        expectClose(result.position, [100, 100, 1, 1]);
    });
});
