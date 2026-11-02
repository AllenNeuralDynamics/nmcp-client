const lightBackgroundColor = "#f3f4f5";
const darkBackgroundColor = "#242424";

export function viewerBackgroundColor(isDark: boolean) {
    return isDark ? darkBackgroundColor : lightBackgroundColor;
}

export type ViewerDimensions = Record<string, [number, string]>;

const defaultDimensions: ViewerDimensions = {
    x: [0.0000001, "m"],
    y: [0.0000001, "m"],
    z: [0.0000001, "m"]
};

export const immutableDefaultState = {
    dimensions: defaultDimensions,
    position: [
        65900.5,
        39900.5,
        56900.5
    ],
    projectionOrientation: [
        -0.2892743945121765,
        0.45396557450294495,
        0.1698378622531891,
        0.8254639506340027
    ],
    crossSectionScale: 271.82818284590446,
    projectionScale: 175770.93378072325,
    projectionDepth: -1226.626509855466,
    showAxisLines: false,
    layout: "3d",
    layerListPanel: {
        visible: false
    },
    selection: {
        visible: false
    },
    showDefaultAnnotations: false
}

export const mirrorCCFv3Transform = {
    matrix: [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, -1, 114000]
    ],
    outputDimensions: defaultDimensions
}

const LOCAL_ANNOTATIONS_URL = "local://annotations";

// Zooms and depths are in canonical voxels, which are the size of the smallest dimension.
const CANONICAL_VOXEL_KEYS = ["crossSectionScale", "projectionScale", "crossSectionDepth", "projectionDepth"];

// A state saved under other dimensions (an old shared link) restored as-is would leave every point the client adds
// later in the wrong place, so it is moved onto the given dimensions with its positions and zooms rescaled to show the
// same view.  A local annotation layer without its own transform takes the global dimensions when it loads, so its
// points are rescaled as well.
export function withDimensions(state: any, dimensions: ViewerDimensions): any {
    const saved: ViewerDimensions = state?.dimensions;

    if (!saved) {
        return state;
    }

    const names = Object.keys(saved);

    const next: ViewerDimensions = {};

    const factors = names.map(name => {
        const target = dimensions[name];

        if (!target || target[1] !== saved[name][1]) {
            next[name] = saved[name];
            return 1;
        }

        next[name] = target;

        return saved[name][0] / target[0];
    });

    if (factors.every(f => f === 1)) {
        return state;
    }

    const smallest = (d: ViewerDimensions) => Math.min(...names.map(name => d[name][0]));

    const voxelFactor = smallest(saved) / smallest(next);

    const rescale = (point: number[]) => point.map((v, i) => v * (factors[i] ?? 1));

    const result = {...state, dimensions: next};

    if (Array.isArray(state.position)) {
        result.position = rescale(state.position);
    }

    for (const key of CANONICAL_VOXEL_KEYS) {
        if (typeof state[key] === "number") {
            result[key] = state[key] * voxelFactor;
        }
    }

    if (Array.isArray(state.layers)) {
        result.layers = state.layers.map((layer: any) => {
            const source = layer.source;

            const followsGlobal = source === LOCAL_ANNOTATIONS_URL || (source?.url === LOCAL_ANNOTATIONS_URL && !source.transform);

            if (!followsGlobal || !Array.isArray(layer.annotations)) {
                return layer;
            }

            return {
                ...layer,
                annotations: layer.annotations.map((a: any) => Array.isArray(a.point) ? {...a, point: rescale(a.point)} : a)
            };
        });
    }

    return result;
}
