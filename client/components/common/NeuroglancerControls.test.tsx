import * as React from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {renderWithProviders} from "../../test/render";
import {NeuroglancerControls} from "./NeuroglancerControls";
import {NeuroglancerViewer} from "../../viewer/neuroglancerViewer";
import {formatViewerState, standaloneViewerUrl} from "../../viewer/neuroglancerStateExport";
import {errorNotification, successNotification} from "./NotificationHelper";

vi.mock("./NotificationHelper");

const OPEN = "Open in Neuroglancer";
const COPY = "Copy Neuroglancer state";

const state = {
    title: "Neuron",
    position: [1, 2, 3],
    layers: [{type: "segmentation", source: "precomputed://s3://bucket/specimen", name: "Specimen Space Reconstruction", segments: ["123"]}],
    showDefaultAnnotations: false,
    crossSectionBackgroundColor: "#242424"
};

const viewer = {currentState: state} as unknown as NeuroglancerViewer;

function renderControls(props: { viewer?: NeuroglancerViewer, allowResetView?: boolean, allowStateExport?: boolean } = {}) {
    const {viewer: v = viewer, allowResetView = true, allowStateExport} = props;

    renderWithProviders(<NeuroglancerControls viewer={v} allowResetView={allowResetView} allowStateExport={allowStateExport}/>);
}

describe("NeuroglancerControls state export", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("hides the export buttons by default", () => {
        renderControls();

        expect(screen.queryByRole("button", {name: OPEN})).not.toBeInTheDocument();
        expect(screen.queryByRole("button", {name: COPY})).not.toBeInTheDocument();
        expect(screen.getAllByRole("separator")).toHaveLength(1);
    });

    it("shows the export buttons after Reset View behind a divider", () => {
        renderControls({allowStateExport: true});

        const names = screen.getAllByRole("button").map(b => b.getAttribute("aria-label"));

        expect(names.slice(-2)).toEqual([OPEN, COPY]);
        expect(screen.getAllByRole("separator")).toHaveLength(2);
    });

    it("keeps the divider without Reset View", () => {
        renderControls({allowResetView: false, allowStateExport: true});

        expect(screen.getByRole("button", {name: OPEN})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: COPY})).toBeInTheDocument();
        expect(screen.getAllByRole("separator")).toHaveLength(1);
    });

    it("opens the standalone state in a new tab", async () => {
        const user = userEvent.setup();
        const open = vi.spyOn(window, "open").mockReturnValue(null);

        renderControls({allowStateExport: true});

        await user.click(screen.getByRole("button", {name: OPEN}));

        expect(open).toHaveBeenCalledTimes(1);
        expect(open).toHaveBeenCalledWith(standaloneViewerUrl(state), "_blank", "noopener,noreferrer");
    });

    it("copies the exact state", async () => {
        const user = userEvent.setup();

        renderControls({allowStateExport: true});

        await user.click(screen.getByRole("button", {name: COPY}));

        expect(await navigator.clipboard.readText()).toBe(formatViewerState(state));
        expect(successNotification).toHaveBeenCalledTimes(1);
        expect(errorNotification).not.toHaveBeenCalled();
    });

    it("reports a failed copy", async () => {
        const user = userEvent.setup();
        vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(new Error("denied"));

        renderControls({allowStateExport: true});

        await user.click(screen.getByRole("button", {name: COPY}));

        expect(errorNotification).toHaveBeenCalledTimes(1);
        expect(successNotification).not.toHaveBeenCalled();
    });

    it("does nothing before the viewer exists", async () => {
        const user = userEvent.setup();
        const open = vi.spyOn(window, "open").mockReturnValue(null);
        const writeText = vi.spyOn(navigator.clipboard, "writeText");

        renderControls({viewer: null, allowStateExport: true});

        await user.click(screen.getByRole("button", {name: OPEN}));
        await user.click(screen.getByRole("button", {name: COPY}));

        expect(open).not.toHaveBeenCalled();
        expect(writeText).not.toHaveBeenCalled();
    });
});
