export enum LayerType {
    // Must match actual neuroglancer layer type values.
    annotation,
    segmentation,
    image
}

export type NeuroglancerLayerSource = {
    name: string;
    type: LayerType;
    source: string;
    isMirror: boolean;
    options?: any;
}

export const defaultAtlasLayerSource: NeuroglancerLayerSource = {
    name: "Atlas",
    type: LayerType.segmentation,
    source: "precomputed://gs://allen_neuroglancer_ccf/ccf_test1",
    isMirror: false
};
