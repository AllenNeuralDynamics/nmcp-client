import {AtlasViewer} from "./atlasViewer";
import {LayerType, NeuroglancerLayerSource} from "./neuroglancerLayer";
import {mirrorCCFv3Transform} from "./neuroglancerViewerState";
import {NeuronViewModel} from "../viewmodel/neuronViewModel";
import {NEURON_VIEW_MODE_ALL, NEURON_VIEW_MODE_AXON, NEURON_VIEW_MODE_DENDRITE, NEURON_VIEW_MODE_SOMA, NeuronViewMode} from "../viewmodel/neuronViewMode";

const SomaLayerName = "Soma";

const FullLayerName = "Full";
const AxonLayerName = "Axon";
const DendriteLayerName = "Dendrite";

const Mirror = "Mirror";

const somaLayerSource: NeuroglancerLayerSource = {
    name: SomaLayerName,
    type: LayerType.annotation,
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
                id: "size",
                type: "float32",
                default: 10
            }
        ],
        shader: "\nvoid main() {\n  setColor(prop_color());\n  setPointMarkerBorderColor(prop_color());\n  setPointMarkerSize(prop_size());\n}\n"
    }
};

type ReconstructionLayerConfiguration = {
    name: string;
    viewMode: NeuronViewMode;
    precomputedLocation: string;
}

const DefaultReconstructionLayerConfiguration: ReconstructionLayerConfiguration[] = [
    {
        name: FullLayerName,
        viewMode: NEURON_VIEW_MODE_ALL,
        precomputedLocation: "full"
    },
    {
        name: AxonLayerName,
        viewMode: NEURON_VIEW_MODE_AXON,
        precomputedLocation: "axon"
    },
    {
        name: DendriteLayerName,
        viewMode: NEURON_VIEW_MODE_DENDRITE,
        precomputedLocation: "dendrite"
    }
]

const createReconstructionSource = (name: string, source: string, isMirror: boolean = false): NeuroglancerLayerSource => {
    return {
        name: name,
        type: LayerType.segmentation,
        source: source,
        transform: isMirror ? mirrorCCFv3Transform : null
    }
}

export type NeuronSelectionDelegate = {
    (neuron: NeuronViewModel, position: number[]): void;
}

export type SomaSelectionDelegate = {
    (neuron: NeuronViewModel): void;
}

export class SearchViewer extends AtlasViewer {
    private _neuronSelectionDelegate: NeuronSelectionDelegate;
    private _somaSelectionDelegate: SomaSelectionDelegate;

    private readonly _precomputedUrl: string;

    private readonly _configurations: ReconstructionLayerConfiguration[] = [];

    private readonly _modelMap = new Map<number, NeuronViewModel>();
    private readonly _somaModelMap = new Map<string, NeuronViewModel>();

    public constructor(elementId: string, atlasSegmentColors: Map<string, string>, precomputedUrl: string, isDarkColorScheme: boolean = false) {
        super(elementId, atlasSegmentColors, isDarkColorScheme);

        this._precomputedUrl = precomputedUrl;

        this._configurations = DefaultReconstructionLayerConfiguration;
    }

    public set neuronSelectionListener(delegate: NeuronSelectionDelegate) {
        this._neuronSelectionDelegate = delegate;
    }

    public set somaSelectionDelegate(delegate: SomaSelectionDelegate) {
        this._somaSelectionDelegate = delegate;
    }

    public updateAtlasStructures(structureIds: number[]) {
        let state = this.currentState;

        state = this.includeAtlasStructures(structureIds, state);

        this._viewer.state.reset();
        this._viewer.state.restoreState(state);
    }

    public updateReconstructions(neurons: NeuronViewModel[] = []) {
        let state = this.currentState;

        state = this.updateSomas(neurons, state);
        state = this.updateReconstructionLayers(neurons, state);

        this._viewer.state.reset();
        this._viewer.state.restoreState(state);
    }

    private updateSomas(neurons: NeuronViewModel[], state: any): any {
        const somas = neurons.filter(n => n.viewMode == NEURON_VIEW_MODE_SOMA && n.soma);

        if (!somas || somas.length === 0) {
            return state;
        }

        const layerIdx = this.findLayer(SomaLayerName, state);

        if (layerIdx == null) {
            return state;
        }

        this._somaModelMap.clear();

        state.layers[layerIdx].annotations = somas.map(n => {
            const soma = n.soma;

            this._somaModelMap.set(soma.id, n);

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

        return state;
    }

    private updateReconstructionLayers(neurons: NeuronViewModel[], state: any): any {
        let update = state;

        this._modelMap.clear();

        neurons.forEach(n => this._modelMap.set(n.SkeletonSegmentId, n));

        for (const configuration of this._configurations) {
            update = this.updateReconstructionLayerPair(configuration.name, neurons.filter(n => n.viewMode == configuration.viewMode), state);
        }

        return update;
    }

    private updateReconstructionLayerPair(name: string, neurons: NeuronViewModel[], state: any): any {
        let update = this.updateReconstructionLayer(name, neurons.filter(n => n.mirror == false), state);

        return this.updateReconstructionLayer(`${name} ${Mirror}`, neurons.filter(n => n.mirror == true), update);
    }

    private updateReconstructionLayer(name: string, neurons: NeuronViewModel[], state: any): any {
        const layerIdx = this.findLayer(name, state);

        if (layerIdx == null) {
            return state;
        }

        state.layers[layerIdx].segments = neurons.map(n => n.SkeletonSegmentId);

        state.layers[layerIdx].segmentColors = neurons.reduce((obj, n) => {
            obj[n.SkeletonSegmentId.toString()] = n.baseColor;
            return obj;
        }, {});

        return state;
    }

    protected get defaultState() {
        let state: any = super.defaultState;

        state.title = "Search";

        state = this.ensureLayer(somaLayerSource, state);

        for (const configuration of this._configurations) {
            state = this.ensureLayer(createReconstructionSource(configuration.name, `precomputed://${this._precomputedUrl}/${configuration.precomputedLocation}`), state);
            state = this.ensureLayer(createReconstructionSource(`${configuration.name} ${Mirror}`, `precomputed://${this._precomputedUrl}/${configuration.precomputedLocation}`, true), state);
        }

        return state;
    }

    protected onSelectionChanged(layerSelection: any) {
        if (!layerSelection) {
            return;
        }

        const state = this.currentState;

        for (const configuration of this._configurations) {
            if (this.trySelectFromLayer(layerSelection, configuration.name, state)) {
                return;
            }

            if (this.trySelectFromLayer(layerSelection, `${configuration.name} ${Mirror}`, state)) {
                return;
            }
        }

        this.trySelectFromSomaLayer(layerSelection, state);
    }

    private trySelectFromLayer(layerSelection: any, name: string, state: any): boolean {
        const id = this.selectFromSegmentationLayer(layerSelection, name, state);

        if (id != null) {
            const mouseState = this.viewer.mouseState;
            this._neuronSelectionDelegate(this._modelMap.get(id), Array.from(mouseState.position.map(n => n)));
            return true;
        }

        return false;
    }

    private trySelectFromSomaLayer(layerSelection: any, state: any) {
        const id = this.selectFromAnnotationLayer(layerSelection, SomaLayerName, state);

        if (id != null) {
            this._somaSelectionDelegate(this._somaModelMap.get(id));
            return true;
        }

        return false;
    }
}
