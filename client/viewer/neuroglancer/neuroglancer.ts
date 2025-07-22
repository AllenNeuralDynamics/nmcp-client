import {debounce} from "lodash-es";
import {makeMinimalViewer} from "neuroglancer/unstable/ui/minimal_viewer.js";
import {getDefaultRenderedDataPanelBindings, setDefaultInputEventBindings} from "neuroglancer/unstable/ui/default_input_event_bindings.js";
import {disableWheel} from "neuroglancer/unstable/ui/disable_default_actions.js";
import {registerEventListener} from "neuroglancer/unstable/util/disposable.js";
import {UserPreferences} from "../../util/userPreferences";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {getSegmentColorMap} from "../../util/colors";
import {NEURON_VIEW_MODE_ALL, NEURON_VIEW_MODE_AXON, NEURON_VIEW_MODE_DENDRITE, NEURON_VIEW_MODE_SOMA} from "../../viewmodel/neuronViewMode";
import {ITracingNode} from "../../models/tracingNode";

// TODO: env var
const PRECOMPUTED_URL = "precomputed://s3://aind-neuron-morphology-community-portal-dev-u5u0i5";

export type NeuronSelectionDelegate = {
    (neuron: NeuronViewModel, position: number[]): void;
}

export type SomaSelectionDelegate = {
    (soma: ITracingNode, neuron: NeuronViewModel): void;
}

export type CandidateSelectionDelegate = {
    (annotationId: string): void;
}

type SearchLayer = {
    name: string;
    index: number;
    source: string;
    isMirror: boolean;
}

const CandidateReconstructionLayer: SearchLayer = {name: "Pending Reconstructions", index: 2, isMirror: false, source: PRECOMPUTED_URL};

const SearchCcfLayer: SearchLayer = {name: "CCF", index: 0, isMirror: false, source: "precomputed://gs://allen_neuroglancer_ccf/ccf_test1"};
const SearchSomaAnnotationLayer: SearchLayer = {name: "Soma", index: 1, isMirror: false, source: "local://annotations"};
const SearchReconstructionLayer: SearchLayer = {name: "Reconstruction", index: 2, isMirror: false, source: `${PRECOMPUTED_URL}/full`};
const SearchReconstructionMirrorLayer: SearchLayer = {name: "Reconstruction Mirror", index: 3, isMirror: true, source: `${PRECOMPUTED_URL}/full`};
const SearchAxonLayer: SearchLayer = {name: "Axon", index: 4, isMirror: false, source: `${PRECOMPUTED_URL}/axon`};
const SearchAxonMirrorLayer: SearchLayer = {name: "Axon Mirror", index: 5, isMirror: true, source: `${PRECOMPUTED_URL}/axon`};
const SearchDendritesLayer: SearchLayer = {name: "Dendrite", index: 6, isMirror: false, source: `${PRECOMPUTED_URL}/dendrite`};
const SearchDendritesMirrorLayer: SearchLayer = {name: "Dendrite Mirror", index: 7, isMirror: true, source: `${PRECOMPUTED_URL}/dendrite`};

const SearchSelectionLayers = [SearchReconstructionLayer, SearchReconstructionMirrorLayer, SearchAxonLayer, SearchAxonMirrorLayer, SearchDendritesLayer, SearchDendritesMirrorLayer];


export class NeuroglancerProxy {
    private _viewer: any = null;
    private _changeHandler: any = null;
    private _defaultState: any = null;

    private _modelMap = new Map<number, NeuronViewModel>();
    private _somaModelMap = new Map<string, NeuronViewModel>();
    private _somaNodeMap = new Map<string, ITracingNode>();

    public static SearchNeuroglancer?: NeuroglancerProxy = null;

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

    public static configureSearchNeuroglancer(id: string, state: any, neuronSelectionDelegate: NeuronSelectionDelegate, somaSelectionDelegate: SomaSelectionDelegate): NeuroglancerProxy {
        const map = getDefaultRenderedDataPanelBindings();
        map.set("at:wheel", {action: "zoom-via-wheel", originalEventIdentifier: "wheel", preventDefault: true});

        const [proxy, target] = NeuroglancerProxy.createCommon(id);

        if (neuronSelectionDelegate) {
            registerEventListener(target, "click", (e: Event) => {
                if (proxy._viewer) {
                    const selected = proxy._viewer.layerSelectedValues.toJSON();

                    if (!selected) {
                        return;
                    }

                    let found = false;

                    SearchSelectionLayers.forEach(layer => {
                        if (!found && selected[layer.name] && selected[layer.name]["value"] && selected[layer.name]["value"]["key"]) {
                            try {
                                const id = parseInt(selected[layer.name]["value"]["key"]);
                                state = proxy._viewer.mouseState;
                                neuronSelectionDelegate(proxy._modelMap.get(id), state.position);
                                found = true;
                            } catch {
                            }
                        }
                    });
                    if (!found && selected[SearchSomaAnnotationLayer.name] && selected[SearchSomaAnnotationLayer.name]["annotationId"]) {
                        const somaId = selected[SearchSomaAnnotationLayer.name]["annotationId"];
                        somaSelectionDelegate(proxy._somaNodeMap.get(somaId), proxy._somaModelMap.get(somaId));
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

        if (state) {
            state["position"] = defaultSearchState.position;
            state["projectionOrientation"] = defaultSearchState.projectionOrientation;
            state["projectionScale"] = defaultSearchState.projectionScale;
        }

        const s = state || defaultSearchState;

        let reset = false;

        // Default compartment visibility.
        if (s.layers?.length >= SearchCcfLayer.index) {
            s.layers[SearchCcfLayer.index].segments = [997];
            reset = true;
        }

        // Clear any stored soma annotations from last session.
        if (s.layers?.length >= SearchSomaAnnotationLayer.index) {
            s.layers[SearchSomaAnnotationLayer.index].annotations = [];
            reset = true;
        }

        // Clear any stored segments from last session.
        for (let idx = SearchReconstructionLayer.index; idx < SearchDendritesMirrorLayer.index; idx++) {
            if (s.layers?.length >= idx) {
                s.layers[idx].segments = [];
                s.layers[idx].segmentColors = {};
                reset = true;
            } else {
                break;
            }
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

        NeuroglancerProxy.SearchNeuroglancer = proxy;

        proxy._viewer.inputEventBindings.perspectiveView.bindings["at:wheel"] = {action: "zoom-via-wheel", preventDefault: true}
        proxy._viewer.inputEventBindings.perspectiveView.bindings["wheel"] = {action: "zoom-via-wheel", preventDefault: true};
        proxy._viewer.inputEventBindings.global.bindings["at:wheel"] = {action: "zoom-via-wheel", preventDefault: true};
        proxy._viewer.inputEventBindings.global.bindings["wheel"] = {action: "zoom-via-wheel", preventDefault: true};

        console.log(proxy._viewer);

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

    public updateSearchReconstructions(somas: NeuronViewModel[], neurons: NeuronViewModel[] = []) {
        const state = this._viewer.state.toJSON();

        this._modelMap.clear();

        this._somaModelMap.clear();
        this._somaNodeMap.clear();

        neurons.forEach(n => this._modelMap.set(n.SkeletonSegmentId, n));

        if (state.layers?.length >= SearchSomaAnnotationLayer.index) {
            const annotations = somas.map(n => {
                const soma = n.somaOnlyTracing.soma;

                this._somaModelMap.set(soma.id, n);
                this._somaNodeMap.set(soma.id, soma);

                return {
                    type: "point",
                    id: soma.id,
                    point: [
                        soma.z / 10,
                        soma.y / 10,
                        soma.x / 10
                    ],
                    props: [n.baseColor, 3]
                };
            });

            state.layers[SearchSomaAnnotationLayer.index].annotations = annotations;
        }

        this.updateSearchReconstructionLayers(state, neurons.filter(n => n.CurrentViewMode == NEURON_VIEW_MODE_ALL), SearchReconstructionLayer, SearchReconstructionMirrorLayer);
        this.updateSearchReconstructionLayers(state, neurons.filter(n => n.CurrentViewMode == NEURON_VIEW_MODE_AXON), SearchAxonLayer, SearchAxonMirrorLayer);
        this.updateSearchReconstructionLayers(state, neurons.filter(n => n.CurrentViewMode == NEURON_VIEW_MODE_DENDRITE), SearchDendritesLayer, SearchDendritesMirrorLayer);

        this._viewer.state.reset();
        this._viewer.state.restoreState(state);
    }

    private updateSearchReconstructionLayers(state: any, neurons: NeuronViewModel[], layer: SearchLayer, mirrorLayer: SearchLayer) {
        if (state.layers?.length >= layer.index) {
            this.updateSearchReconstructionLayerContents(state.layers[layer.index], neurons, false)
        }
        if (state.layers?.length >= mirrorLayer.index) {
            this.updateSearchReconstructionLayerContents(state.layers[mirrorLayer.index], neurons, true)
        }
    }

    private updateSearchReconstructionLayerContents(layer: any, neurons: NeuronViewModel[], selectMirror: boolean) {
        const display = neurons.filter(n => n.mirror == selectMirror);
        layer.segments = display.map(n => n.SkeletonSegmentId);
        layer.segmentColors = display.reduce((obj, n) => {
            obj[n.SkeletonSegmentId.toString()] = n.baseColor;
            return obj;
        }, {});
    }

    public updateSearchCompartments(compartmentIds: number[] = []) {
        const state = this._viewer.state.toJSON();

        let stateChanged = false;

        if (state.layers?.length > 0) {
            state.layers[SearchCcfLayer.index].segments = compartmentIds;
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

    public resetView() {
        const state = this._viewer.state.toJSON();

        state.position = this._defaultState.position;
        state.projectionOrientation = this._defaultState.projectionOrientation;
        state.projectionScale = this._defaultState.projectionScale;
        state.crossSectionScale = this._defaultState.crossSectionScale;
        state.showAxisLines = this._defaultState.showAxisLines;

        this._viewer.state.reset();
        this._viewer.state.restoreState(state);
    }

    public unlinkNeuroglancerHandler() {
        if (typeof this._changeHandler === "object") {
            this._changeHandler.dispose();
        } else {
            this._changeHandler();
        }
    }
}

function reconstructionLayer(layerDefinition: SearchLayer) {
    const layer = {
        "type": "segmentation",
        "source": {
            "url": layerDefinition.source
        },
        "tab": "segments",
        "segments": [],
        "name": layerDefinition.name
    };

    if (layerDefinition.isMirror) {
        layer.source["transform"] = {
            "matrix": [
                [
                    1,
                    0,
                    0,
                    0
                ],
                [
                    0,
                    1,
                    0,
                    0
                ],
                [
                    0,
                    0,
                    -1,
                    1140
                ]
            ],
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
    }

    return layer;
}

const defaultCandidateState = {
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
        659.5,
        399.5,
        569.5
    ],
    "projectionOrientation": [],
    "crossSectionScale": 2.7182818284590446,
    "projectionScale": 2048,
    "showAxisLines": false,
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
        reconstructionLayer(CandidateReconstructionLayer),
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

const defaultSearchState = {
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
    }, "position": [
        659.5,
        399.5,
        569.5
    ],
    "crossSectionScale": 2.7182818284590446,
    "projectionOrientation": [
        -0.2892743945121765,
        0.45396557450294495,
        0.1698378622531891,
        0.8254639506340027
    ],
    "projectionScale": 2048,
    "showAxisLines": false,
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
            "name": "Soma"
        },
        reconstructionLayer(SearchReconstructionLayer),
        reconstructionLayer(SearchReconstructionMirrorLayer),
        reconstructionLayer(SearchAxonLayer),
        reconstructionLayer(SearchAxonMirrorLayer),
        reconstructionLayer(SearchDendritesLayer),
        reconstructionLayer(SearchDendritesMirrorLayer)
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
