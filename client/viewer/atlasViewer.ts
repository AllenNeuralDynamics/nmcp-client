import {NeuroglancerViewer} from "./neuroglancerViewer";
import {defaultAtlasLayerSource} from "./neuroglancerLayer";

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

    protected includeAtlasStructures(state: any, ids: number[], includeRoot: boolean = false) {
        if (includeRoot && ids.findIndex(s => s == 997) == -1) {
            ids.push(997);
        }

        const segments = ids.map(s => s.toString());

        const layerIndex = this.findLayer(defaultAtlasLayerSource.name, state);

        state.layers[layerIndex].segments = segments;
    }
}
