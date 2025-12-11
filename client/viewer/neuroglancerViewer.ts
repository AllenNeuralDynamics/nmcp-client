import {debounce} from "lodash-es";

import {makeMinimalViewer} from "neuroglancer/unstable/ui/minimal_viewer.js";
import {getDefaultRenderedDataPanelBindings, setDefaultInputEventBindings} from "neuroglancer/unstable/ui/default_input_event_bindings.js";
import {disableWheel} from "neuroglancer/unstable/ui/disable_default_actions.js";
import {registerEventListener} from "neuroglancer/unstable/util/disposable.js";
import {Viewer} from "neuroglancer/unstable/viewer.js";
import {immutableDefaultState, viewerBackgroundColor} from "./neuroglancerViewerState";
import {LayerType, NeuroglancerLayerSource} from "./neuroglancerLayer";

export type StateListener = (obj: object) => void;

export type PositionCallback = {
    (position: number[]): void;
}

export class NeuroglancerViewer {
    protected readonly _viewer: Viewer;

    private _isDarkColorScheme: boolean = false;

    private _stateChangeHandler: any = null;
    private _positionCallback: any = null;

    public constructor(elementId: string, isDarkColorScheme: boolean = false) {
        const target = document.getElementById(elementId)

        if (target == null) {
            console.log("failed to find target element");
            return;
        }

        registerEventListener(target, "contextmenu", (e: Event) => {
            e.preventDefault();
        });

        registerEventListener(target, "click", (_: Event) => {
            const layerSelections = this.viewer.layerSelectedValues.toJSON();
            this.onSelectionChanged(layerSelections);
        });

        this._isDarkColorScheme = isDarkColorScheme;

        this._viewer = makeMinimalViewer({target: target});

        this.setMouseWheelToZoom();
    }

    public updateState(state?: object) {
        this.restoreState(state ?? this.defaultState);
    }

    public set stateListener(listener: StateListener) {
        if (listener != null && this.viewer) {
            const throttledSetUrlHash = debounce(() => listener(this.currentState), 500)

            this._stateChangeHandler = this.viewer.state.changed.add(throttledSetUrlHash);
        }
    }

    public set PositionListener(callback: PositionCallback) {
        if (callback != null && this.viewer && this._positionCallback == null) {
            const positionCallback = () => {
                const s: Float32Array<ArrayBufferLike> = this.viewer.state.viewer.mouseState.position;
                callback(this.viewer.state.viewer.mouseState.active ? Array.from(s.map(n => Math.floor(n))) : []);
            };

            this._positionCallback = this.viewer.state.viewer.mouseState.changed.add(positionCallback);
        }
    }

    public set colorScheme(isDarkColorScheme: boolean) {
        this._isDarkColorScheme = isDarkColorScheme;

        this.restoreState(this.updateStateForColorScheme(this.currentState));
    }

    public resetView() {
        this.restoreState({...this.currentState, ...immutableDefaultState});
    }

    public unlink(): void {
        if (this._stateChangeHandler) {
            if (typeof this._stateChangeHandler === "object") {
                this._stateChangeHandler.dispose();
            } else {
                this._stateChangeHandler();
            }
        }

        if (this._positionCallback) {
            if (typeof this._positionCallback === "object") {
                this._positionCallback.dispose();
            } else {
                this._positionCallback();
            }
        }
    }

    protected get viewer() {
        return this._viewer;
    }

    protected onSelectionChanged(layerSelection: any) {
    }

    protected selectFromAnnotationLayer(layerSelection: any, name: string, state: any): string {
        const index = this.findLayer(name, state);

        if (index == null || index == -1) {
            return null;
        }

        if (layerSelection[name] && layerSelection[name]["annotationId"]) {
            return layerSelection[name]["annotationId"];
        }

        return null;
    }


    protected selectFromSegmentationLayer(layerSelection: any, name: string, state: any): number {
        const index = this.findLayer(name, state);

        if (index == null || index == -1) {
            return null;
        }

        if (layerSelection[name] && layerSelection[name]["value"] && layerSelection[name]["value"]["key"]) {
            const value = parseInt(layerSelection[name]["value"]["key"]);
            return isNaN(value) ? null : value;
        }

        return null;
    }

    protected restoreState(state: object) {
        if (state) {
            this.viewer.state.reset();
            this.viewer.state.restoreState(state);
        }
    }

    protected setPosition(state: any, x: number, y: number, z: number): any {
        state.position = [x, y, z, 0];

        return state;
    }

    protected findLayer(name: string, state: any): number {
        if (state?.layers) {
            return state.layers.findIndex((layer: any) => layer.name === name);
        }

        return null;
    }

    protected removeLayer(name: string, state: any): any {
        const current = this.findLayer(name, state);

        if (current && current >= 0) {
            state.layers.splice(current, 1);
        }
    }

    protected ensureLayer(layerSource: NeuroglancerLayerSource, state: any, exclusive: boolean = false): any {
        const current = this.findLayer(layerSource.name, state);

        if (current && current >= 0) {
            return;
        }

        const source = {
            url: layerSource.source,
        }

        if (layerSource.transform) {
            source["transform"] = layerSource.transform;
        }

        const layer: any = {
            name: layerSource.name,
            type: LayerType[layerSource.type],
            source: source,
            visible: true,
            ...layerSource.options
        };

        if (state.layers && !exclusive) {
            state.layers.push(layer);
        } else {
            state.layers = [layer];
        }

        return state;
    }

    protected setMouseWheelToZoom() {
        disableWheel();

        const map = getDefaultRenderedDataPanelBindings();

        map.set("at:wheel", {action: "zoom-via-wheel", originalEventIdentifier: "wheel", preventDefault: true});

        setDefaultInputEventBindings(this.viewer.inputEventBindings)
    }

    protected get currentState(): any {
        return this.viewer.state.toJSON();
    }

    protected get defaultState() {
        return this.updateStateForColorScheme({...immutableDefaultState});
    }

    private updateStateForColorScheme(state: any): any {
        const color = viewerBackgroundColor(this._isDarkColorScheme);

        state.crossSectionBackgroundColor = color;
        state.projectionBackgroundColor = color;

        return state;
    }
}

