import {NeuronViewModel} from "./neuronViewModel";
import {ITracing} from "../models/tracing";
import {ITracingNode} from "../models/tracingNode";
import {ITracingStructure} from "../models/tracingStructure";

export class TracingViewModel {
    id: string;
    tracing: ITracing;
    structure: ITracingStructure;
    soma: ITracingNode;
    nodeLookup: Map<number, ITracingNode>;

    private readonly _neuron: NeuronViewModel;

    public constructor(id: string, neuron: NeuronViewModel) {
        this._neuron = neuron;

        this.id = id;
        this.tracing = null;
        this.structure = null;
        this.soma = null;
        this.nodeLookup = null;
    }

    public get neuron() {
        return this._neuron;
    }
}
