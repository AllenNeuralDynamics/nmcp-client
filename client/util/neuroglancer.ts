import {debounce} from "lodash-es";
import {makeMinimalViewer} from "neuroglancer/unstable/ui/minimal_viewer.js";
import {setDefaultInputEventBindings} from "neuroglancer/unstable/ui/default_input_event_bindings.js";
import {disableWheel} from "neuroglancer/unstable/ui/disable_default_actions.js";
import {registerEventListener} from "neuroglancer/unstable/util/disposable.js";
import {NdbConstants} from "../models/constants";
import {UserPreferences} from "./userPreferences";

export class NeuroglancerProxy {
    private _viewer: any = null;
    private _changeHandler: any = null;

    public static configureNeuroglancer(id: string, state: any, annotations: any) {
        const proxy = new NeuroglancerProxy()

        const target = document.getElementById(id)

        if (target == null) {
            return;
        }

        registerEventListener(target, "contextmenu", (e: Event) => {
            e.preventDefault();
        });

        defaultState.layers[1]["segmentColors"] = getSegmentColorMap()

        disableWheel();

        proxy._viewer = makeMinimalViewer();

        setDefaultInputEventBindings(proxy._viewer.inputEventBindings);

        const s = state || defaultState;

        s.layers[0].annotations = annotations;

        proxy._viewer.state.restoreState(s);

        const throttledSetUrlHash = debounce(
            () => UserPreferences.Instance.candidateViewerState = proxy._viewer.state.toJSON(),
            500
        );

        proxy._changeHandler = proxy._viewer.state.changed.add(throttledSetUrlHash);

        return proxy;
    }

    public updateAnnotations(annotations: any) {
        const state = this._viewer.state.toJSON();

        state.layers[0].annotations = annotations;

        this._viewer.state.restoreState(state);
    }

    public resetNeuroglancerState() {
        this._viewer.state.restoreState({"position": defaultState.position})
        this._viewer.state.restoreState({"projectionScale": defaultState.projectionScale})
        this._viewer.state.restoreState({"crossSectionScale": defaultState.crossSectionScale})
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

const defaultState = {
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
            "annotationProperties":[
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
            "segments": ["997"],
            "objectAlpha": 0.20,
            "name": "CCF",
            "visible": true
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
