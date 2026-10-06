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

// CCFv3-only until the API supplies a per-atlas mirror transform.
export function ccfMirrorTransform(atlas: Atlas) {
    return atlas?.atlasKind?.kind === AtlasKindId.Mouse ? mirrorCCFv3Transform : null;
}
