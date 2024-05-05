import {makeMinimalViewer} from "neuroglancer/ui/minimal_viewer.js";
import {setDefaultInputEventBindings} from "neuroglancer/ui/default_input_event_bindings.js";
import {disableWheel} from "neuroglancer/ui/disable_default_actions.js";
import {registerEventListener} from "neuroglancer/util/disposable.js";

export const configureNeuroglancerContainer = (containerName: string) => {
    const target = document.getElementById(containerName)
    registerEventListener(target, "contextmenu", (e: Event) => {
        e.preventDefault();
    });
    disableWheel();
    const viewer = makeMinimalViewer();
    setDefaultInputEventBindings(viewer.inputEventBindings);

    const state= {
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
            ]
        },
        "position": [
            1193.8330078125,
            626.8327026367188,
            519.5003051757812
        ],
        "crossSectionScale": 1,
        "projectionOrientation": [
            0.2047690600156784,
            0.2665390074253082,
            0.029955923557281494,
            -0.9413443803787231
        ],
        "projectionScale": 456.9705679839845,
        "layers": [
            {
                "type": "annotation",
                "source": "precomputed://gs://nmcp-precomputred-test",
                "tab": "source",
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
                "segments": [],
                "name": "CCF"
            }
        ],
        "selectedLayer": {
            "visible": true,
            "layer": "CCF"
        },
        "layout": "4panel"
    };

    // viewer.state.restoreState(state)
}
