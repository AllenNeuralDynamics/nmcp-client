import {NeuroglancerViewer} from "./neuroglancerViewer";
import {LayerType, NeuroglancerLayerSource} from "./neuroglancerLayer";

export const defaultAtlasLayerSource: NeuroglancerLayerSource = {
    name: "Atlas",
    type: LayerType.segmentation,
    source: "precomputed://gs://allen_neuroglancer_ccf/ccf_test1"
};

export class AtlasViewer extends NeuroglancerViewer {
    private readonly _atlasSegmentColors: Map<string, string>

    public constructor(elementId: string, atlasSegmentColors: Map<string, string>, isDarkColorScheme: boolean = false) {
        super(elementId, isDarkColorScheme);

        this._atlasSegmentColors = atlasSegmentColors;
    }

    protected get defaultState() {
        const state: object = super.defaultState;

        return this.ensureLayer(Object.assign({}, defaultAtlasLayerSource, {
            options: {
                segments: [997],
                segmentColors: this._atlasSegmentColors,
                objectAlpha: 0.20
            }
        }), state);
    }

    protected includeAtlasStructures(ids: number[], state: any, includeRoot: boolean = false): any {
        if (includeRoot && ids.findIndex(s => s == 997) == -1) {
            ids.push(997);
        }

        const segments = ids.map(s => s.toString());

        const layerIndex = this.findLayer(defaultAtlasLayerSource.name, state);

        state.layers[layerIndex].segments = segments;

        return state;
    }
}
