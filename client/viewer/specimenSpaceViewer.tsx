import {TomographyViewer} from "./tomographyViewer";
import {LayerType} from "./neuroglancerLayer";

const LAYER_NAME = "Specimen Space Reconstruction"

export class SpecimenSpaceViewer extends TomographyViewer {
    private readonly _precomputedUrl: string;

    public constructor(elementId: string, precomputedUrl: string, isDarkColorScheme: boolean = false) {
        super(elementId, isDarkColorScheme);

        this._precomputedUrl = precomputedUrl;
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
            source: `precomputed://${this._precomputedUrl}/specimen`,
            options: {
                skeletonRendering: {
                    mode2d: "lines",
                    lineWidth2d: 1
                }
            }
        }, state);

        return state;
    }
}