import {TracingStructure} from "../models/tracingStructure";

export class NeuronViewMode {
    id: string;
    structure: TracingStructure;
    value: number;
    text: string;

    public constructor(id: string, viewMode: TracingStructure, value: number)  {
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

function makeTracingViewModes(): NeuronViewMode[] {

    const modes: NeuronViewMode[] = [];

    NEURON_VIEW_MODE_ALL = new NeuronViewMode("All", TracingStructure.all, 0);
    modes.push(NEURON_VIEW_MODE_ALL);

    NEURON_VIEW_MODE_AXON = new NeuronViewMode("Axon", TracingStructure.axon, 1);
    modes.push(NEURON_VIEW_MODE_AXON);

    NEURON_VIEW_MODE_DENDRITE = new NeuronViewMode("Dendrite", TracingStructure.dendrite, 2);
    modes.push(NEURON_VIEW_MODE_DENDRITE);

    NEURON_VIEW_MODE_SOMA = new NeuronViewMode("Soma", TracingStructure.soma, 3);
    modes.push(NEURON_VIEW_MODE_SOMA);

    return modes;
}
