import {debounce} from "lodash-es";
import {makeMinimalViewer} from "neuroglancer/unstable/ui/minimal_viewer.js";
import {setDefaultInputEventBindings} from "neuroglancer/unstable/ui/default_input_event_bindings.js";
import {disableWheel} from "neuroglancer/unstable/ui/disable_default_actions.js";
import {registerEventListener} from "neuroglancer/unstable/util/disposable.js";
import {NdbConstants} from "../models/constants";
import {UserPreferences} from "./userPreferences";
import {NeuronViewModel} from "../viewmodel/neuronViewModel";

export type SearchSelectionDelegate = {
    (neuron: NeuronViewModel, position: number[]): void;
}

export type CandidateSelectionDelegate = {
    (annotationId: string): void;
}

export class NeuroglancerProxy {
    private _viewer: any = null;
    private _changeHandler: any = null;
    private _defaultState: any = null;

    private _modelMap = new Map<number, NeuronViewModel>();

    public static configureCandidateNeuroglancer(id: string, state: any, annotations: any, selectionDelegate: CandidateSelectionDelegate): NeuroglancerProxy {
        const [proxy, target] = NeuroglancerProxy.createCommon(id);

        registerEventListener(target, "click", (e: Event) => {
            if (proxy._viewer && selectionDelegate) {
                const selected = proxy._viewer.layerSelectedValues.toJSON();

                if (selected && selected["Candidates"] && selected["Candidates"]["annotationId"]) {
                    selectionDelegate(selected["Candidates"]["annotationId"]);
                }
            }
        });

        const ccf_layer = defaultCandidateState.layers.find(s => s.name == "CCF")

        if (ccf_layer) {
            ccf_layer["segmentColors"] = getSegmentColorMap()
        }

        disableWheel();

        proxy._viewer = makeMinimalViewer();

        setDefaultInputEventBindings(proxy._viewer.inputEventBindings);

        let s = state || defaultCandidateState;

        if (s?.layers?.length > 0) {
            s.layers[0].annotations = annotations;
        } else {
            s = defaultCandidateState;
            s.layers[0].annotations = annotations;
        }

        proxy._viewer.state.restoreState(s);

        const throttledSetUrlHash = debounce(
            () => UserPreferences.Instance.candidateViewerState = proxy._viewer.state.toJSON(),
            500
        );

        proxy._changeHandler = proxy._viewer.state.changed.add(throttledSetUrlHash);

        proxy._defaultState = defaultCandidateState;

        return proxy;
    }

    public static configureSearchNeuroglancer(id: string, state: any, selectionDelegate: SearchSelectionDelegate): NeuroglancerProxy {
        const [proxy, target] = NeuroglancerProxy.createCommon(id);

        if (selectionDelegate) {
            registerEventListener(target, "click", (e: Event) => {
                if (proxy._viewer) {
                    const selected = proxy._viewer.layerSelectedValues.toJSON();

                    if (selected && selected["Reconstructions"] && selected["Reconstructions"]["value"] && selected["Reconstructions"]["value"]["key"]) {
                        try {
                            const id = parseInt(selected["Reconstructions"]["value"]["key"]);
                            state = proxy._viewer.mouseState;
                            selectionDelegate(proxy._modelMap.get(id), state.position);
                        } catch {
                        }
                    }
                }
            });
        }
        const ccf_layer = defaultSearchState.layers.find(s => s.name == "CCF")

        if (ccf_layer) {
            ccf_layer["segmentColors"] = getSegmentColorMap()
        }

        disableWheel();

        proxy._viewer = makeMinimalViewer();

        setDefaultInputEventBindings(proxy._viewer.inputEventBindings);

        const s = state || defaultSearchState;

        let reset = false;

        if (s.layers?.length > 0) {
            s.layers[0].segments = [997];
            reset = true;
        }


        if (s.layers?.length > 1) {
            s.layers[1].segments = [];
            reset = true;
        }

        if (s.layers?.length > 2) {
            s.layers[2].annotations = [];
            reset = true;
        }

        if (reset) {
            proxy._viewer.state.reset();
        }

        proxy._viewer.state.restoreState(s);

        const throttledSetUrlHash = debounce(
            () => UserPreferences.Instance.searchViewerState = proxy._viewer.state.toJSON(),
            500
        );

        proxy._changeHandler = proxy._viewer.state.changed.add(throttledSetUrlHash);

        proxy._defaultState = defaultSearchState;

        return proxy;
    }

    private static createCommon(id: string): [NeuroglancerProxy, HTMLElement] {
        const proxy = new NeuroglancerProxy()

        const target = document.getElementById(id)

        if (target == null) {
            return [null, null];
        }

        registerEventListener(target, "contextmenu", (e: Event) => {
            e.preventDefault();
        });

        return [proxy, target];
    }

    public updateCandidateAnnotations(annotations: any, selectedSkeletonSegmentId: number = null) {
        const state = this._viewer.state.toJSON();

        let stateChanged = false;

        if (state.layers?.length > 0) {
            state.layers[0].annotations = annotations;
            stateChanged = true;
        }

        if (state.layers?.length > 2) {
            if (selectedSkeletonSegmentId) {
                state.layers[2].segments = [selectedSkeletonSegmentId];
            } else {
                state.layers[2].segments = [];
            }
            stateChanged = true;
        }

        if (stateChanged) {
            this._viewer.state.reset();
            this._viewer.state.restoreState(state);
        }
    }

    public updateSearchReconstructions(somas: any[], neurons: NeuronViewModel[] = []) {
        const state = this._viewer.state.toJSON();

        let stateChanged = false;

        this._modelMap.clear();

        if (state.layers?.length > 1) {
            neurons.forEach(n => this._modelMap.set(n.SkeletonSegmentId, n));
            state.layers[1].segments = neurons.map(n => n.SkeletonSegmentId);
            stateChanged = true;
        }

        if (state.layers?.length > 2) {
            state.layers[2].annotations = somas;
            stateChanged = true;
        }

        if (stateChanged) {
            this._viewer.state.reset();
            this._viewer.state.restoreState(state);
        }
    }

    public updateSearchCompartments(compartmentIds: number[] = []) {
        const state = this._viewer.state.toJSON();

        let stateChanged = false;

        if (state.layers?.length > 0) {
            state.layers[0].segments = compartmentIds;
            stateChanged = true;
        }

        if (stateChanged) {
            this._viewer.state.reset();
            this._viewer.state.restoreState(state);
        }
    }

    public resetNeuroglancerState() {
        this._viewer.state.restoreState(this._defaultState);
    }

    public unlinkNeuroglancerHandler() {
        if (typeof this._changeHandler === "object") {
            this._changeHandler.dispose();
        } else {
            this._changeHandler();
        }
    }
}

let colorMap = null;

function getSegmentColorMap() {
    if (colorMap == null) {
        colorMap = {};

        NdbConstants.DefaultConstants.BrainAreas.map(b => {
            if (b.geometryEnable) {
                colorMap[b.structureId.toString()] = "#" + b.geometryColor;
            }
        });
    }

    return colorMap;
}

export const defaultCandidateState = {
    dimensions: {
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
        727.4166259765625,
        401.1028137207031,
        569.8789672851562,
        0
    ],
    "projectionOrientation": [],
    "crossSectionScale": 2.7182818284590446,
    "projectionScale": 2048,
    "layers": [
        {
            "type": "annotation",
            "source": {
                "url": "local://annotations",
                "transform": {
                    "outputDimensions": {
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
                        ]
                    }
                }
            },
            "tool": "annotatePoint",
            "tab": "annotations",
            "annotationColor": "#2184d0",
            "annotations": [],
            "annotationProperties": [
                {
                    "id": "color",
                    "type": "rgba",
                    "default": "#ff0000ff"
                },
                {
                    "id": "size",
                    "type": "float32",
                    "default": 10
                }
            ],
            "shader": "\nvoid main() {\n  setColor(prop_color());\n  setPointMarkerSize(prop_size());\n}\n",
            "name": "Candidates"
        },
        {
            "type": "segmentation",
            "source": {
                "url": "precomputed://gs://allen_neuroglancer_ccf/ccf_test1",
                "subsources": {
                    "default": true,
                    "properties": true,
                    "mesh": true
                },
                "enableDefaultSubsources": false
            },
            "tab": "source",
            "segments": [997],
            "objectAlpha": 0.20,
            "name": "CCF",
            "visible": true
        },
        {
            "type": "segmentation",
            "source": "precomputed://s3://aind-neuron-morphology-community-portal-dev-u5u0i5",
            "tab": "segments",
            "segments": [],
            "name": "Pending Reconstructions"
        }
    ],
    "selectedLayer": {
        "layer": "CCF"
    },
    "layout": "3d",
    "layerListPanel": {
        "visible": false
    },
    "selection": {
        "visible": false
    },
    "showDefaultAnnotations": false,
    "crossSectionBackgroundColor": "#ffffff",
    "projectionBackgroundColor": "#ffffff"
};

export const defaultSearchState = {
    dimensions: {
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
    },  "position": [
        554.5824584960938,
        512.8468627929688,
        514.7276000976562
    ],
    "crossSectionScale": 2.7182818284590446,
    "projectionOrientation": [
        0.2751387655735016,
        -0.45192277431488037,
        -0.23387466371059418,
        -0.815700352191925
    ],
    "projectionScale": 2048,
    "layers": [
        {
            "type": "segmentation",
            "source": {
                "url": "precomputed://gs://allen_neuroglancer_ccf/ccf_test1",
                "subsources": {
                    "default": true,
                    "properties": true,
                    "mesh": true
                },
                "enableDefaultSubsources": false
            },
            "tab": "source",
            "segments": [997],
            "objectAlpha": 0.20,
            "name": "CCF",
            "visible": true
        },
        {
            "type": "segmentation",
            "source": "precomputed://s3://aind-neuron-morphology-community-portal-dev-u5u0i5",
            "tab": "segments",
            "segments": [],
            "name": "Reconstructions"
        }, {
            "type": "annotation",
            "source": {
                "url": "local://annotations",
                "transform": {
                    "outputDimensions": {
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
                        ]
                    }
                }
            },
            "tool": "annotatePoint",
            "tab": "annotations",
            "annotationColor": "#2184d0",
            "annotations": [],
            "annotationProperties": [
                {
                    "id": "color",
                    "type": "rgba",
                    "default": "#ff0000ff"
                },
                {
                    "id": "size",
                    "type": "float32",
                    "default": 10
                }
            ],
            "shader": "\nvoid main() {\n  setColor(prop_color());\n  setPointMarkerSize(prop_size());\n}\n",
            "name": "Somas"
        }
    ],
    "selectedLayer": {
        "layer": "CCF"
    },
    "layout": "3d",
    "layerListPanel": {
        "visible": false
    },
    "selection": {
        "visible": false
    },
    "showDefaultAnnotations": false,
    "crossSectionBackgroundColor": "#ffffff",
    "projectionBackgroundColor": "#ffffff"
};
