import {NeuroglancerViewer} from "./neuroglancerViewer";
import {AtlasLayerName, createAtlasLayerSource} from "./atlasLayer";
import {AtlasViewModel} from "../viewmodel/atlasViewModel";
import {Atlas} from "../models/atlas";

export class AtlasViewer extends NeuroglancerViewer {
    // Null only when no Mouse atlas is loaded; the viewer then has no atlas layer.
    private readonly _atlasViewModel: AtlasViewModel;

    public constructor(elementId: string, atlasViewModel: AtlasViewModel, isDarkColorScheme: boolean = false) {
        super(elementId, isDarkColorScheme);

        this._atlasViewModel = atlasViewModel;
    }

    protected get atlas(): Atlas {
        return this._atlasViewModel?.atlas ?? null;
    }

    protected get defaultState() {
        const state: object = super.defaultState;

        if (!this.atlas) {
            return state;
        }

        return this.ensureLayer(createAtlasLayerSource(this.atlas), state);
    }

    protected includeAtlasStructures(ids: number[], state: any, includeRoot: boolean = false): any {
        if (!this.atlas) {
            return state;
        }

        const rootId = this.atlas.rootStructureId;

        if (includeRoot && ids.findIndex(s => s == rootId) == -1) {
            ids.push(rootId);
        }

        const segments = ids.map(s => s.toString());

        const layerIndex = this.findLayer(AtlasLayerName, state);

        state.layers[layerIndex].segments = segments;

        return state;
    }

    // The live counterpart of includeAtlasStructures: changes the atlas layer's visible segments in place, without the
    // state restore that rebuilds every layer.
    protected showAtlasStructures(ids: number[], includeRoot: boolean = false): void {
        if (!this.atlas) {
            return;
        }

        const group = (this.viewer.layerManager.getLayerByName(AtlasLayerName)?.layer as any)?.displayState?.segmentationGroupState?.value;

        if (!group) {
            return;
        }

        const structureIds = new Set(ids);

        if (includeRoot) {
            structureIds.add(this.atlas.rootStructureId);
        }

        const segments = [...structureIds].map(id => BigInt(id));

        group.selectedSegments.clear();
        group.visibleSegments.clear();

        group.selectedSegments.add(segments);
        group.visibleSegments.add(segments);
    }
}
