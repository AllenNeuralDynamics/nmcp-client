import {NeuroglancerViewer} from "./neuroglancerViewer";
import {LayerType, NeuroglancerLayerSource} from "./neuroglancerLayer";
import {Tomography, TomographyRange} from "../models/specimen";

const defaultTomographyViewerState = {
    "dimensions": {
        "x": [
            0.00001,
            "m"
        ],
        "y": [
            0.00001,
            "m"
        ],
        "z": [
            0.00001,
            "m"
        ],
        "t": [
            0.001,
            "s"
        ]
    },
    "position": [
        2456.76953125,
        1115.9412841796875,
        1384.6180419921875,
        0
    ],
    "crossSectionScale": 6,
    "projectionOrientation": [
        -0.1677646040916443,
        0.4672170877456665,
        0.1222904622554779,
        0.8594232201576233
    ],
    "projectionScale": 3376.5811623938635,
    "layout": "4panel",
    layerListPanel: {
        visible: false
    },
    selection: {
        visible: false
    },
    showDefaultAnnotations: false
}

const createTomographySource = (name: string, source: string, range: TomographyRange, window: TomographyRange): NeuroglancerLayerSource => {
    const shaderControls = (range || window) ? {
        shaderControls: {
            normalized: {
                range: range,
                window: window
            }
        }
    } : {};

    return {
        name: name,
        type: LayerType.image,
        source: source,
        options: {
            localDimensions: {
                "c'": [
                    1,
                    ""
                ]
            },
            localPosition: [
                0
            ],
            tab: "rendering",
            ...shaderControls
        }
    }
}

export class TomographyViewer extends NeuroglancerViewer {
    public constructor(elementId: string, isDarkColorScheme: boolean = false) {
        super(elementId, isDarkColorScheme);
    }

    public setTomography(name: string, tomography: Tomography) {
        if (tomography?.url) {
            const state = this.ensureLayer(createTomographySource(name, `zarr://${tomography.url}`, tomography.options?.range, tomography.options?.window), this.currentState);

            this.restoreState(state);
        }
    }

    public resetView() {
        this.restoreState({...this.currentState, ...defaultTomographyViewerState});
    }

    protected get defaultState() {
        const state: any = defaultTomographyViewerState;

        state.title = "Specimen";

        return state;
    }
}
