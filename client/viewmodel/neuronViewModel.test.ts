import {describe, expect, it} from "vitest";

import {NeuronViewModel} from "./neuronViewModel";
import {NEURON_VIEW_MODE_ALL, NEURON_VIEW_MODE_AXON} from "./neuronViewMode";
import {NeuronShape} from "../models/neuron";

const neuron = {id: "n1", label: "N1", published: {atlasReconstruction: {id: "r1", soma: null, precomputed: {skeletonId: 7}}}} as unknown as NeuronShape;

const viewModel = () => new NeuronViewModel(neuron, "#123456");

describe("neuron view model state", () => {
    it("enters the results whole, selected and unmirrored", () => {
        const v = viewModel();

        expect(v.viewMode).toBe(NEURON_VIEW_MODE_ALL);
        expect(v.isSelected).toBe(true);
        expect(v.isMirrored).toBe(false);
    });

    it("leaves out the fields still at their entry values", () => {
        expect(viewModel().serialize()).toEqual({neuronId: "n1", baseColor: "#123456"});
    });

    it("keeps the fields that changed", () => {
        const v = viewModel();

        v.viewMode = NEURON_VIEW_MODE_AXON;
        v.isSelected = false;
        v.isMirrored = true;

        expect(v.serialize()).toEqual({neuronId: "n1", baseColor: "#123456", viewModeId: "Axon", isSelected: false, isMirrored: true});
    });

    it("restores a partial state with the entry values for the fields left out", () => {
        const v = viewModel();

        v.viewMode = NEURON_VIEW_MODE_AXON;
        v.isSelected = false;
        v.isMirrored = true;

        v.deserialize({neuronId: "n1", baseColor: "#abcdef"});

        expect(v.baseColor).toBe("#abcdef");
        expect(v.viewMode).toBe(NEURON_VIEW_MODE_ALL);
        expect(v.isSelected).toBe(true);
        expect(v.isMirrored).toBe(false);
    });

    it("round-trips changed fields", () => {
        const source = viewModel();

        source.viewMode = NEURON_VIEW_MODE_AXON;
        source.isMirrored = true;

        const target = viewModel();

        target.deserialize(source.serialize());

        expect(target.serialize()).toEqual(source.serialize());
    });

    it("falls back to the whole neuron for an unknown view mode and ignores another neuron's state", () => {
        const v = viewModel();

        v.deserialize({neuronId: "n1", baseColor: "#123456", viewModeId: "Unknown"});
        expect(v.viewMode).toBe(NEURON_VIEW_MODE_ALL);

        v.deserialize({neuronId: "n2", baseColor: "#000000", isMirrored: true});
        expect(v.isMirrored).toBe(false);
    });
});
