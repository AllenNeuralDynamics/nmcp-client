import {NeuronStructureKind} from "../models/neuronStructure";

const _modesById = new Map<string, NeuronViewMode>();

export class NeuronViewMode {
    id: string;
    structure: NeuronStructureKind;
    value: number;
    text: string;

    public constructor(id: string, viewMode: NeuronStructureKind, value: number) {
        this.id = id;
        this.structure = viewMode;
        this.value = value;
        this.text = id;
    }
}

export let NEURON_VIEW_MODE_ALL: NeuronViewMode | null = null;
export let NEURON_VIEW_MODE_AXON: NeuronViewMode | null = null;
export let NEURON_VIEW_MODE_DENDRITE: NeuronViewMode | null = null;
export let NEURON_VIEW_MODE_SOMA: NeuronViewMode | null = null;

export const NEURON_VIEW_MODES: NeuronViewMode[] = makeTracingViewModes();

export function getViewMode(id: string) {
    return _modesById.get(id);
}

function makeTracingViewModes(): NeuronViewMode[] {

    const modes: NeuronViewMode[] = [];

    NEURON_VIEW_MODE_ALL = new NeuronViewMode("All", NeuronStructureKind.all, 0);
    modes.push(NEURON_VIEW_MODE_ALL);

    NEURON_VIEW_MODE_AXON = new NeuronViewMode("Axon", NeuronStructureKind.axon, 1);
    modes.push(NEURON_VIEW_MODE_AXON);

    NEURON_VIEW_MODE_DENDRITE = new NeuronViewMode("Dendrite", NeuronStructureKind.dendrite, 2);
    modes.push(NEURON_VIEW_MODE_DENDRITE);

    NEURON_VIEW_MODE_SOMA = new NeuronViewMode("Soma", NeuronStructureKind.soma, 3);
    modes.push(NEURON_VIEW_MODE_SOMA);

    modes.map(m => {
        _modesById.set(m.id, m);
    });

    return modes;
}
