import {NeuronViewModel} from "./neuronViewModel";
import {ITracing} from "../models/tracing";
import {ITracingNode} from "../models/tracingNode";
import {ITracingStructure} from "../models/tracingStructure";

export class TracingViewModel {
    id: string;
    tracing: ITracing;
    structure: ITracingStructure;
    soma: ITracingNode;

    private readonly _neuron: NeuronViewModel;

    public constructor(tracing: ITracing, neuron: NeuronViewModel) {
        this._neuron = neuron;

        this.id = tracing.id;
        this.tracing = tracing;
        this.structure = tracing.tracingStructure;
        this.soma = tracing.soma;
    }

    public get neuron() {
        return this._neuron;
    }
}
