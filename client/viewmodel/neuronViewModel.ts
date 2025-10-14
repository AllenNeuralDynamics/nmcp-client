import {makeObservable, observable} from "mobx";

import {INeuron} from "../models/neuron";
import {NEURON_VIEW_MODE_ALL, NeuronViewMode} from "./neuronViewMode";
import {TracingViewModel} from "./tracingViewModel";
import {ITracingNode} from "../models/tracingNode";

export class NeuronViewModel {
    neuron: INeuron = null;

    isSelected: boolean = true;

    baseColor: string = "#000000";

    mirror: boolean = false;

    hasAxonTracing: boolean = false;
    hasDendriteTracing: boolean = false;

    soma: ITracingNode = null;

    tracings: TracingViewModel[] = [];

    viewMode: NeuronViewMode;

    private readonly reconstructionId: string = null;
    private readonly skeletonId: number = null;

    public constructor(neuron: INeuron, color: string | null = null) {
        this.neuron = neuron;

        this.viewMode = NEURON_VIEW_MODE_ALL;

        this.isSelected = false;

        this.baseColor = color || "#000000";

        this.mirror = false;

        this.hasAxonTracing = false;
        this.hasDendriteTracing = false;

        this.soma = null;

        if (this.neuron.latest) {
            this.reconstructionId = this.neuron.latest.id;
            this.skeletonId = this.neuron.latest.precomputed?.skeletonSegmentId;
        }

        makeObservable(this, {
            viewMode: observable,
            isSelected: observable,
            baseColor: observable,
            mirror: observable
        })

        this.assignTracings();
    }

    public get Id() {
        return this.neuron.id;
    }

    public get ReconstructionId(): string {
        return this.reconstructionId;
    }

    public get SkeletonSegmentId(): number {
        return this.skeletonId;
    }

    private assignTracings() {
        if (!this.neuron) {
            return;
        }

        if (this.neuron.latest?.axon) {
            const model = new TracingViewModel(this.neuron.latest.axon, this);
            this.tracings.push(model);
            this.hasAxonTracing = true;
            this.soma = model.soma;
        }

        if (this.neuron.latest?.dendrite) {
            const model = new TracingViewModel(this.neuron.latest.dendrite, this);
            this.tracings.push(model);
            this.hasDendriteTracing = true;
            if (!this.soma) {
                this.soma = model.soma;
            }
        }
    }

    public get State() {
        return {
            id: this.Id,
            isSelected: this.isSelected,
            baseColor: this.baseColor,
            mirror: this.mirror
        };
    }
}
