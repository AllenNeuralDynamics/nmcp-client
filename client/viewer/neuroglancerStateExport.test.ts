import {describe, expect, it} from "vitest";

import {formatViewerState, NEUROGLANCER_DEMO_URL, standaloneViewerState, standaloneViewerUrl} from "./neuroglancerStateExport";

const view = {
    dimensions: {x: [0.00001, "m"], y: [0.00001, "m"], z: [0.00001, "m"]},
    position: [2456.5, 1115.5, 1384.5],
    crossSectionScale: 6,
    projectionOrientation: [-0.17, 0.47, 0.12, 0.86],
    projectionScale: 3376.5,
    layout: "4panel",
    title: "Neuron",
    layers: [
        {type: "image", source: "zarr://s3://bucket/specimen.zarr", name: "Specimen"},
        {type: "segmentation", source: "precomputed://s3://bucket/precomputed/specimen", name: "Specimen Space Reconstruction", segments: ["123"]},
        {type: "annotation", source: "local://annotations", name: "Soma", annotations: [{point: [10, 20, 30], type: "point", id: "soma"}]}
    ]
};

const presentation = {
    showDefaultAnnotations: false,
    showAxisLines: false,
    crossSectionBackgroundColor: "#242424",
    projectionBackgroundColor: "#242424",
    layerListPanel: {visible: false, size: 400},
    selection: {visible: false, row: 2}
};

const embedded = {...view, ...presentation};

const prefix = `${NEUROGLANCER_DEMO_URL}#!`;

const decodeUrl = (url: string) => JSON.parse(decodeURIComponent(url.slice(prefix.length)));

describe("standaloneViewerState", () => {
    it("removes the portal presentation overrides and keeps the data and view", () => {
        expect(standaloneViewerState(embedded)).toEqual(view);
    });

    it("removes hidden panels as whole entries", () => {
        const standalone = standaloneViewerState(embedded);

        expect("layerListPanel" in standalone).toBe(false);
        expect("selection" in standalone).toBe(false);
    });

    it("keeps panels the user opened", () => {
        const state = {...view, layerListPanel: {visible: true}, selection: {layers: {Soma: {}}}};

        expect(standaloneViewerState(state)).toEqual(state);
    });

    it("does not mutate its input", () => {
        const before = structuredClone(embedded);

        standaloneViewerState(embedded);

        expect(embedded).toEqual(before);
    });

    it("returns an equal copy of a state without overrides", () => {
        const standalone = standaloneViewerState(view);

        expect(standalone).toEqual(view);
        expect(standalone).not.toBe(view);
    });
});

describe("standaloneViewerUrl", () => {
    it("opens the demo instance with the standalone state in the hash", () => {
        const url = standaloneViewerUrl(embedded);

        expect(url.startsWith(prefix)).toBe(true);
        expect(decodeUrl(url)).toEqual(standaloneViewerState(embedded));
    });

    it("escapes characters a plain encodeURI leaves raw", () => {
        const state = {...view, layers: [{...view.layers[2], name: "Soma (marker), 1"}]};

        const fragment = standaloneViewerUrl(state).slice(prefix.length);

        expect(fragment).not.toMatch(/[ (),]/);
        expect(decodeUrl(standaloneViewerUrl(state)).layers[0].name).toBe("Soma (marker), 1");
    });

    it("serializes bigint segments as strings", () => {
        const state = {...view, layers: [{...view.layers[1], segments: [5n]}]};

        expect(decodeUrl(standaloneViewerUrl(state)).layers[0].segments).toEqual(["5"]);
    });
});

describe("formatViewerState", () => {
    it("formats like the Neuroglancer state dialog", () => {
        expect(formatViewerState(embedded)).toBe(JSON.stringify(embedded, null, "  "));
    });

    it("keeps the presentation overrides", () => {
        expect(JSON.parse(formatViewerState(embedded))).toEqual(embedded);
    });

    it("serializes bigint values as strings", () => {
        const state = {...view, layers: [{...view.layers[1], segments: [5n]}]};

        expect(JSON.parse(formatViewerState(state)).layers[0].segments).toEqual(["5"]);
    });
});
