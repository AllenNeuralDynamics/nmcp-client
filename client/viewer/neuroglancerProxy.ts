import {debounce} from "lodash-es";

import {makeMinimalViewer} from "neuroglancer/unstable/ui/minimal_viewer.js";
import {getDefaultRenderedDataPanelBindings, setDefaultInputEventBindings} from "neuroglancer/unstable/ui/default_input_event_bindings.js";
import {disableWheel} from "neuroglancer/unstable/ui/disable_default_actions.js";
import {registerEventListener} from "neuroglancer/unstable/util/disposable.js";

import {NEURON_VIEW_MODE_ALL, NEURON_VIEW_MODE_AXON, NEURON_VIEW_MODE_DENDRITE} from "../viewmodel/neuronViewMode";
import {UserPreferences} from "../util/userPreferences";
import {NeuronViewModel} from "../viewmodel/neuronViewModel";
import {ITracingNode} from "../models/tracingNode";
import {SearchLayer, SearchLayers} from "./layerDefinitions";

export type NeuronSelectionDelegate = {
    (neuron: NeuronViewModel, position: number[]): void;
}

export type SomaSelectionDelegate = {
    (soma: ITracingNode, neuron: NeuronViewModel): void;
}

export type CandidateSelectionDelegate = {
    (annotationId: string): void;
}

export class NeuroglancerProxy {
    private _viewer: any = null;
    private _changeHandler: any = null;
    private _defaultState: any = null;

    private _modelMap = new Map<number, NeuronViewModel>();
    private _somaModelMap = new Map<string, NeuronViewModel>();
    private _somaNodeMap = new Map<string, ITracingNode>();

    private _segmentColors = new Map<string, string>();

    private _searchLayers: SearchLayers;

    public static SearchNeuroglancer?: NeuroglancerProxy = null;

    private static _cachedQueryParamsState: any = null;

    public static configureCandidateNeuroglancer(id: string, state: any, annotations: any, selectionDelegate: CandidateSelectionDelegate, precomputedLocation: string, segmentColors: Map<string, string>): NeuroglancerProxy {
        const [proxy, target] = NeuroglancerProxy.createCommon(id, segmentColors);

        registerEventListener(target, "click", (_: Event) => {
            if (proxy._viewer && selectionDelegate) {
                const selected = proxy._viewer.layerSelectedValues.toJSON();

                if (selected && selected["Candidates"] && selected["Candidates"]["annotationId"]) {
                    selectionDelegate(selected["Candidates"]["annotationId"]);
                }
            }
        });

        proxy._searchLayers = new SearchLayers(`precomputed://${precomputedLocation}`);

        disableWheel();

        proxy._viewer = makeMinimalViewer();

        setDefaultInputEventBindings(proxy._viewer.inputEventBindings);

        let s = state || defaultCandidateState(proxy._searchLayers, proxy._segmentColors);

        // proxy.applyCcfSegmentColors(s, proxy._searchLayers.CandidateCcfLayer, proxy._segmentColors);

        if (s?.layers?.length > 0) {
            s.layers[0].annotations = annotations;
        } else {
            s = defaultCandidateState(proxy._searchLayers);
            s.layers[0].annotations = annotations;
        }

        proxy._viewer.state.restoreState(s);

        const throttledSetUrlHash = debounce(
            () => UserPreferences.Instance.candidateViewerState = proxy._viewer.state.toJSON(),
            500
        );

        proxy._changeHandler = proxy._viewer.state.changed.add(throttledSetUrlHash);

        proxy._defaultState = defaultCandidateState(proxy._searchLayers, proxy._segmentColors);

        return proxy;
    }

    public static configureSearchNeuroglancer(id: string, state: any, neuronSelectionDelegate: NeuronSelectionDelegate, somaSelectionDelegate: SomaSelectionDelegate, precomputedLocation: string, segmentColors: Map<string, string>): NeuroglancerProxy {
        const map = getDefaultRenderedDataPanelBindings();

        map.set("at:wheel", {action: "zoom-via-wheel", originalEventIdentifier: "wheel", preventDefault: true});

        const [proxy, target] = NeuroglancerProxy.createCommon(id, segmentColors);

        proxy._searchLayers = new SearchLayers(`precomputed://${precomputedLocation}`);

        if (neuronSelectionDelegate) {
            registerEventListener(target, "click", (_: Event) => {
                if (proxy._viewer) {
                    const selected = proxy._viewer.layerSelectedValues.toJSON();

                    if (!selected) {
                        return;
                    }

                    let found = false;

                    proxy._searchLayers.SearchSelectionLayers.forEach(layer => {
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
                    if (!found && selected[proxy._searchLayers.SearchSomaAnnotationLayer.name] && selected[proxy._searchLayers.SearchSomaAnnotationLayer.name]["annotationId"]) {
                        const somaId = selected[proxy._searchLayers.SearchSomaAnnotationLayer.name]["annotationId"];
                        somaSelectionDelegate(proxy._somaNodeMap.get(somaId), proxy._somaModelMap.get(somaId));
                    }
                }
            });
        }

        disableWheel();

        proxy._viewer = makeMinimalViewer();

        setDefaultInputEventBindings(proxy._viewer.inputEventBindings);

        if (state) {
            state["position"] = immutableDefaultSearchState.position;
            state["projectionOrientation"] = immutableDefaultSearchState.projectionOrientation;
            state["projectionScale"] = immutableDefaultSearchState.projectionScale;
        }

        const s = NeuroglancerProxy._cachedQueryParamsState || state || defaultSearchState(proxy._searchLayers, proxy._segmentColors);

        // proxy.applyCcfSegmentColors(s, proxy._searchLayers.SearchCcfLayer);

        NeuroglancerProxy._cachedQueryParamsState = null;

        let reset = false;

        // Default compartment visibility.
        if (s.layers?.length >= proxy._searchLayers.SearchCcfLayer.index) {
            s.layers[proxy._searchLayers.SearchCcfLayer.index].segments = [997];
            reset = true;
        }

        // Clear any stored soma annotations from last session.
        if (s.layers?.length >= proxy._searchLayers.SearchSomaAnnotationLayer.index) {
            s.layers[proxy._searchLayers.SearchSomaAnnotationLayer.index].annotations = [];
            reset = true;
        }

        // Clear any stored segments from last session.
        for (let idx = proxy._searchLayers.SearchReconstructionLayer.index; idx < proxy._searchLayers.SearchDendritesMirrorLayer.index; idx++) {
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

        proxy._defaultState = defaultSearchState(proxy._searchLayers, proxy._segmentColors);

        NeuroglancerProxy.SearchNeuroglancer = proxy;

        proxy._viewer.inputEventBindings.perspectiveView.bindings["at:wheel"] = {action: "zoom-via-wheel", preventDefault: true}
        proxy._viewer.inputEventBindings.perspectiveView.bindings["wheel"] = {action: "zoom-via-wheel", preventDefault: true};
        proxy._viewer.inputEventBindings.global.bindings["at:wheel"] = {action: "zoom-via-wheel", preventDefault: true};
        proxy._viewer.inputEventBindings.global.bindings["wheel"] = {action: "zoom-via-wheel", preventDefault: true};

        return proxy;
    }

    public static applyQueryParameterState(state: any) {
        if (!state) {
            return;
        }

        if (NeuroglancerProxy.SearchNeuroglancer) {
            NeuroglancerProxy.SearchNeuroglancer._viewer.state.reset();
            NeuroglancerProxy.SearchNeuroglancer._viewer.state.restoreState(state);
        } else {
            NeuroglancerProxy._cachedQueryParamsState = state;
        }
    }

    private static createCommon(id: string, segmentColors: Map<string, string>): [NeuroglancerProxy, HTMLElement] {
        const proxy = new NeuroglancerProxy()

        proxy._segmentColors = segmentColors;

        const target = document.getElementById(id)

        if (target == null) {
            return [null, null];
        }

        registerEventListener(target, "contextmenu", (e: Event) => {
            e.preventDefault();
        });

        return [proxy, target];
    }

    public get State() {
        return this._viewer ? this._viewer.state : null;
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

        if (state.layers?.length >= this._searchLayers.SearchSomaAnnotationLayer.index) {
            state.layers[this._searchLayers.SearchSomaAnnotationLayer.index].annotations = somas.map(n => {
                const soma = n.somaOnlyTracing.soma;

                this._somaModelMap.set(soma.id, n);
                this._somaNodeMap.set(soma.id, soma);

                return {
                    type: "point",
                    id: soma.id,
                    point: [
                        soma.x / 10,
                        soma.y / 10,
                        soma.z / 10
                    ],
                    props: [n.baseColor, 3]
                };
            });
        }

        this.updateSearchReconstructionLayers(state, neurons.filter(n => n.viewMode == NEURON_VIEW_MODE_ALL), this._searchLayers.SearchReconstructionLayer, this._searchLayers.SearchReconstructionMirrorLayer);
        this.updateSearchReconstructionLayers(state, neurons.filter(n => n.viewMode == NEURON_VIEW_MODE_AXON), this._searchLayers.SearchAxonLayer, this._searchLayers.SearchAxonMirrorLayer);
        this.updateSearchReconstructionLayers(state, neurons.filter(n => n.viewMode == NEURON_VIEW_MODE_DENDRITE), this._searchLayers.SearchDendritesLayer, this._searchLayers.SearchDendritesMirrorLayer);

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
            state.layers[this._searchLayers.SearchCcfLayer.index].segments = compartmentIds;
            state.layers[this._searchLayers.SearchCcfLayer.index].segments = compartmentIds;
            stateChanged = true;
        }

        if (stateChanged) {
            this._viewer.state.reset();
            this._viewer.state.restoreState(state);
        }
    }

    public resetNeuroglancerState() {
        this._viewer.state.reset();
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

const immutableDefaultCandidateState = {
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
}

function defaultCandidateState(layers: SearchLayers, segmentColors: Map<string, string> = null) {
    const state = {
        ...immutableDefaultCandidateState,
        "layers": [
            {
                "type": "annotation",
                "source": {
                    "url": layers.CandidateAnnotationLayer.source,
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
                "name": layers.CandidateAnnotationLayer.name
            },
            {
                "type": "segmentation",
                "source": {
                    "url": layers.CandidateCcfLayer.source,
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
                "name": layers.CandidateCcfLayer.name,
                "visible": true
            },
            reconstructionLayer(layers.CandidateReconstructionLayer),
        ],
        "selectedLayer": {
            "layer": layers.CandidateCcfLayer.name,
        }
    };

    if (segmentColors) {
        state.layers[1]["segmentColors"] = segmentColors;
    }

    return state;
}

const immutableDefaultSearchState = {
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
}

function defaultSearchState(layers: SearchLayers, segmentColors: Map<string, string> = null) {
    const state = {
        ...immutableDefaultSearchState,
        "layers": [
            {
                "type": "segmentation",
                "source": {
                    "url": layers.SearchCcfLayer.source,
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
                "name": layers.SearchCcfLayer.name,
                "visible": true
            }, {
                "type": "annotation",
                "source": {
                    "url": layers.SearchSomaAnnotationLayer.source,
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
                "name": layers.SearchSomaAnnotationLayer.name
            },
            reconstructionLayer(layers.SearchReconstructionLayer),
            reconstructionLayer(layers.SearchReconstructionMirrorLayer),
            reconstructionLayer(layers.SearchAxonLayer),
            reconstructionLayer(layers.SearchAxonMirrorLayer),
            reconstructionLayer(layers.SearchDendritesLayer),
            reconstructionLayer(layers.SearchDendritesMirrorLayer)
        ],
        "selectedLayer": {
            "layer": layers.SearchCcfLayer.name
        }
    };

    if (segmentColors) {
        state.layers[0]["segmentColors"] = segmentColors;
    }

    return state;
}
