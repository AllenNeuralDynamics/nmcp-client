import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {makeMinimalViewer} from "neuroglancer/unstable/ui/minimal_viewer.js";

import {NeuroglancerViewer} from "./neuroglancerViewer";

// The real modules need WebGL, which jsdom cannot provide.
vi.mock("neuroglancer/unstable/ui/minimal_viewer.js", () => ({makeMinimalViewer: vi.fn()}));
vi.mock("neuroglancer/unstable/ui/default_input_event_bindings.js", () => ({
    getDefaultRenderedDataPanelBindings: () => new Map(),
    setDefaultInputEventBindings: vi.fn()
}));
vi.mock("neuroglancer/unstable/ui/disable_default_actions.js", () => ({disableWheel: vi.fn()}));
vi.mock("neuroglancer/unstable/util/disposable.js", () => ({registerEventListener: vi.fn()}));
vi.mock("neuroglancer/unstable/viewer.js", () => ({Viewer: class {}}));

const ELEMENT_ID = "test-ng-container";

function fakeNeuroglancer(container: HTMLElement) {
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);

    const loseContext = vi.fn();
    const stateChanged: (() => void)[] = [];
    const removeStateListener = vi.fn();
    const removePositionListener = vi.fn();

    const viewer = {
        dispose: vi.fn(),
        display: {
            dispose: vi.fn(),
            canvas,
            gl: {getExtension: vi.fn((name: string) => name === "WEBGL_lose_context" ? {loseContext} : null)}
        },
        inputEventBindings: {},
        state: {
            changed: {
                add: vi.fn((handler: () => void) => {
                    stateChanged.push(handler);
                    return removeStateListener;
                })
            },
            toJSON: () => ({}),
            viewer: {mouseState: {changed: {add: vi.fn(() => removePositionListener)}}}
        }
    };

    return {viewer, canvas, loseContext, stateChanged, removeStateListener, removePositionListener};
}

describe("NeuroglancerViewer.unlink", () => {
    let container: HTMLElement;
    let fake: ReturnType<typeof fakeNeuroglancer>;

    beforeEach(() => {
        container = document.createElement("div");
        container.id = ELEMENT_ID;
        document.body.appendChild(container);

        fake = fakeNeuroglancer(container);
        vi.mocked(makeMinimalViewer).mockReturnValue(fake.viewer as any);
    });

    afterEach(() => {
        container.remove();
        vi.useRealTimers();
    });

    it("disposes the viewer and the display it does not own, releasing the WebGL context and canvas", () => {
        const viewer = new NeuroglancerViewer(ELEMENT_ID);

        viewer.unlink();

        expect(fake.viewer.dispose).toHaveBeenCalledOnce();
        expect(fake.viewer.display.dispose).toHaveBeenCalledOnce();
        expect(fake.loseContext).toHaveBeenCalledOnce();
        expect(container.contains(fake.canvas)).toBe(false);
    });

    it("removes the state and position listeners", () => {
        const viewer = new NeuroglancerViewer(ELEMENT_ID);
        viewer.stateListener = vi.fn();
        viewer.PositionListener = vi.fn();

        viewer.unlink();

        expect(fake.removeStateListener).toHaveBeenCalledOnce();
        expect(fake.removePositionListener).toHaveBeenCalledOnce();
    });

    it("cancels a debounced state notification still pending at unlink", () => {
        vi.useFakeTimers();

        const listener = vi.fn();
        const viewer = new NeuroglancerViewer(ELEMENT_ID);
        viewer.stateListener = listener;

        fake.stateChanged.forEach(handler => handler());
        viewer.unlink();
        vi.advanceTimersByTime(1000);

        expect(listener).not.toHaveBeenCalled();
    });

    it("is safe to call more than once", () => {
        const viewer = new NeuroglancerViewer(ELEMENT_ID);
        viewer.stateListener = vi.fn();

        viewer.unlink();
        viewer.unlink();

        expect(fake.viewer.dispose).toHaveBeenCalledOnce();
        expect(fake.viewer.display.dispose).toHaveBeenCalledOnce();
        expect(fake.removeStateListener).toHaveBeenCalledOnce();
    });
});
