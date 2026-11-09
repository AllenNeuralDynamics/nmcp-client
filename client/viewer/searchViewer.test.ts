import {describe, expect, it, vi} from "vitest";

import {withoutDerivedNeuronContent} from "./searchViewer";

// The viewer base class pulls in Neuroglancer's WebGL modules, which jsdom cannot load.
vi.mock("./atlasViewer", () => ({AtlasViewer: class {}}));

const state = {
    position: [1, 2, 3],
    layers: [
        {name: "CCF", type: "segmentation", segments: ["997", "315"]},
        {name: "Soma", type: "annotation", annotations: [{type: "point", id: "s1", point: [1, 2, 3]}], shader: "main"},
        {name: "Full", type: "segmentation", source: "precomputed://x/full", segments: ["7"], segmentColors: {"7": "#ff0000"}},
        {name: "Axon Mirror", type: "segmentation", source: "precomputed://x/axon", segments: ["8"], segmentColors: {"8": "#00ff00"}, transform: {}}
    ]
};

describe("withoutDerivedNeuronContent", () => {
    it("drops somas and reconstruction segments but keeps the atlas structures and the view", () => {
        expect(withoutDerivedNeuronContent(state)).toEqual({
            position: [1, 2, 3],
            layers: [
                {name: "CCF", type: "segmentation", segments: ["997", "315"]},
                {name: "Soma", type: "annotation", shader: "main"},
                {name: "Full", type: "segmentation", source: "precomputed://x/full"},
                {name: "Axon Mirror", type: "segmentation", source: "precomputed://x/axon", transform: {}}
            ]
        });
    });

    it("leaves the live state untouched", () => {
        const before = structuredClone(state);

        withoutDerivedNeuronContent(state);

        expect(state).toEqual(before);
    });
});
