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
    options?: any;
    transform?: any;
}

