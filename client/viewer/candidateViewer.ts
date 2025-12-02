import {AtlasViewer} from "./atlasViewer";

import {LayerType, NeuroglancerLayerSource} from "./neuroglancerLayer";
import {NeuronShape} from "../models/neuron";

export type SelectionListener = (id: string) => void;

const candidateLayerSource: NeuroglancerLayerSource = {
    name: "Candidates",
    type: LayerType.annotation,
    isMirror: false,
    source: "local://annotations",
    options: {
        tool: "annotatePoint",
        tab: "annotations",
        annotationColor: "#2184d0",
        annotations: [],
        annotationProperties: [
            {
                id: "color",
                type: "rgba",
                default: "#ff0000ff"
            },
            {
                id: "marker",
                type: "rgba",
                default: "#ffffffff"
            },
            {
                id: "size",
                type: "float32",
                default: 5
            }
        ],
        shader: "\nvoid main() {\n  setColor(prop_color());\n  setPointMarkerBorderWidth(0.1);\n  setPointMarkerBorderColor(prop_marker());\n  setPointMarkerSize(prop_size());\n}\n"
    }
};

export class CandidateViewer extends AtlasViewer {
    private _selectionListener: SelectionListener;

    public constructor(elementId: string, atlasSegmentColors: Map<string, string>, isDarkColorScheme: boolean = false) {
        super(elementId, atlasSegmentColors, isDarkColorScheme);
    }

    public updateNeurons(neurons: NeuronShape[], selected: NeuronShape) {
        const annotations = this.createAnnotations(neurons, selected);

        const state = this.currentState;

        const index = this.findLayer(candidateLayerSource.name, state);

        if (index != undefined && index >= 0) {
            state.layers[index].annotations = annotations;
        }

        this.setSelection(state, selected);

        this.restoreState(state);
    }

    public set selectionListener(listener: SelectionListener) {
        this._selectionListener = listener;
    }

    protected get defaultState() {
        const state: any = super.defaultState;

        state.title = "Candidates";

        return this.ensureLayer(candidateLayerSource, state);
    }

    protected onSelectionChanged(layerSelection: any) {
        if (layerSelection.hasOwnProperty(candidateLayerSource.name)) {
            if (layerSelection[candidateLayerSource.name].hasOwnProperty("annotationId")) {
                if (this._selectionListener) {
                    this._selectionListener(layerSelection[candidateLayerSource.name]["annotationId"]);
                }
            }
        }
    }

    private setSelection(state: any, neuron: NeuronShape) {
        if (neuron) {
            if (neuron.atlasSoma) {
                if (neuron.atlasSoma.x && neuron.atlasSoma.y && neuron.atlasSoma.z) {
                    this.setPosition(state, neuron.atlasSoma.x / 10, neuron.atlasSoma.y / 10, neuron.atlasSoma.z / 10);
                }
            }

            if (neuron.atlasStructure?.structureId) {
                this.includeAtlasStructures(state, [neuron.atlasStructure.structureId], true);
            }
        } else {
            this.includeAtlasStructures(state, [], true);
        }
    }

    private createAnnotations(neurons: NeuronShape[], selected: NeuronShape) {
        const defaultColor = selected ? "#2184d033" : "#2184d0ff";
        const defaultSize = selected ? 3 : 5;

        return neurons.filter(n => n.atlasSoma && n.atlasSoma.x != 0 && n.atlasSoma.y != 0 && n.atlasSoma.z != 0).map(n => {
            return {
                type: "point",
                id: n.id,
                point: [
                    (n.atlasSoma.x) / 10,
                    (n.atlasSoma.y) / 10,
                    (n.atlasSoma.z) / 10,
                    0
                ],
                props: [n == selected ? "#00ff00ff" : defaultColor, n == selected ? "#ffffffff" : "#000000ff", n == selected ? 5 : defaultSize]
            }
        });
    }
}
