import {AtlasViewer} from "./atlasViewer";
import {LayerType} from "./neuroglancerLayer";

const LAYER_NAME = "Atlas Space Reconstruction"

export type PositionSelectionDelegate = {
    (position: number[]): void;
}

export class AtlasSpaceViewer extends AtlasViewer {
    private _neuronSelectionDelegate: PositionSelectionDelegate;

    private readonly _precomputedUrl: string;

    public constructor(elementId: string, atlasSegmentColors: Map<string, string>, precomputedUrl: string, isDarkColorScheme: boolean = false) {
        super(elementId, atlasSegmentColors, isDarkColorScheme);

        this._precomputedUrl = precomputedUrl;
    }

    public set neuronSelectionListener(delegate: PositionSelectionDelegate) {
        this._neuronSelectionDelegate = delegate;
    }

    public updateAtlasStructures(structureIds: number[]) {
        let state = this.currentState;

        state = this.includeAtlasStructures(structureIds, state);

        this._viewer.state.reset();
        this._viewer.state.restoreState(state);
    }

    public setNeuronSkeletonId(id: number[]): any {
        let state = this.currentState;

        const layerIdx = this.findLayer(LAYER_NAME, state);

        if (layerIdx == null) {
            return state;
        }

        if (!id || id.length === 0) {
            state.layers[layerIdx].segments = [];
        } else {
            state.layers[layerIdx].segments = id.map(s => s.toString());
        }

        this._viewer.state.reset();
        this._viewer.state.restoreState(state);
    }

    protected get defaultState() {
        let state: any = super.defaultState;

        state.title = "Neuron";

        state = this.ensureLayer({
            name: LAYER_NAME,
            type: LayerType.segmentation,
            source: `precomputed://${this._precomputedUrl}/full`
        }, state);

        return state;
    }

    protected onSelectionChanged(layerSelection: any) {
        if (!layerSelection) {
            return;
        }

        const state = this.currentState;

        const id = this.selectFromSegmentationLayer(layerSelection, LAYER_NAME, state);

        if (id != null) {
            const mouseState = this.viewer.mouseState;
            this._neuronSelectionDelegate(Array.from(mouseState.position.map(n => n)));
        }
    }
}