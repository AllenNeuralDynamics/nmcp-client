import {LayerType, NeuroglancerLayerSource} from "./neuroglancerLayer";
import {mirrorCCFv3Transform} from "./neuroglancerViewerState";
import {Atlas} from "../models/atlas";
import {AtlasKindId} from "../models/atlasKind";

export const AtlasLayerName = "Atlas";

export function createAtlasLayerSource(atlas: Atlas): NeuroglancerLayerSource {
    return {
        name: AtlasLayerName,
        type: LayerType.segmentation,
        source: atlas.geometryUrl,
        options: {
            segments: [atlas.rootStructureId],
            segmentColors: atlas.StructureColors,
            objectAlpha: 0.20
        }
    };
}

function mapAtlasLayer(state: any, update: (layer: any) => any): any {
    if (!state?.layers?.some((layer: any) => layer.name === AtlasLayerName)) {
        return state;
    }

    return {...state, layers: state.layers.map((layer: any) => layer.name === AtlasLayerName ? update(layer) : layer)};
}

// The atlas layer's structure colors are the atlas defaults unless changed in the viewer, so a saved state need keep
// only the changed ones; withDefaultStructureColors supplies the rest again.
export function withoutDefaultStructureColors(state: any, atlas: Atlas | null): any {
    if (!atlas) {
        return state;
    }

    const defaults = atlas.StructureColors;

    return mapAtlasLayer(state, ({segmentColors, ...layer}) => {
        // Compared without case: Neuroglancer writes colors in lowercase, the atlas keeps them as the API sends them.
        const changed = Object.entries(segmentColors ?? {}).filter(([id, color]) => String(color).toLowerCase() !== defaults[id]?.toLowerCase());

        return changed.length > 0 ? {...layer, segmentColors: Object.fromEntries(changed)} : layer;
    });
}

export function withDefaultStructureColors(state: any, atlas: Atlas | null): any {
    if (!atlas) {
        return state;
    }

    return mapAtlasLayer(state, layer => ({...layer, segmentColors: {...atlas.StructureColors, ...layer.segmentColors}}));
}

// CCFv3-only until the API supplies a per-atlas mirror transform.
export function ccfMirrorTransform(atlas: Atlas) {
    return atlas?.atlasKind?.kind === AtlasKindId.Mouse ? mirrorCCFv3Transform : null;
}
