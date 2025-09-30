import {INeuron} from "../models/neuron";
import {
    NEURON_VIEW_MODE_ALL, NEURON_VIEW_MODE_AXON, NEURON_VIEW_MODE_DENDRITE, NEURON_VIEW_MODE_SOMA, NeuronViewMode
} from "./neuronViewMode";
import {TracingViewModel} from "./tracingViewModel";
import {TracingStructure, TracingStructures} from "../models/tracingStructure";
import {makeObservable, observable} from "mobx";

export class NeuronViewModel {
    neuron: INeuron = null;

    isSelected: boolean = true;

    baseColor: string = "#000000";

    mirror: boolean = false;

    hasAxonTracing: boolean = false;
    hasDendriteTracing: boolean = false;

    somaOnlyTracing: TracingViewModel = null;

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

        this.somaOnlyTracing = null;

        if (this.neuron.reconstructions?.length > 0) {
            this.reconstructionId = this.neuron.reconstructions[0].id;
            this.skeletonId = this.neuron.reconstructions[0].precomputed?.skeletonSegmentId;
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

        this.neuron.tracings.map(t => {
            if (!t) {
                return;
            }

            const model = new TracingViewModel(t.id, this);

            model.soma = t.soma;
            model.structure = t.tracingStructure;

            this.tracings.push(model);

            if (t.tracingStructure.value === TracingStructure.axon) {
                this.hasAxonTracing = true;
            }

            if (t.tracingStructure.value === TracingStructure.dendrite) {
                this.hasDendriteTracing = true;
            }
        });

        if (this.tracings.length > 0) {
            if (this.neuron.tracings[0]) {
                const somaTracingModel = new TracingViewModel(this.neuron.id, this);

                // Borrow soma data from one of the tracings.
                somaTracingModel.soma = this.neuron.tracings[0].soma;

                somaTracingModel.structure = TracingStructures.Soma;

                this.somaOnlyTracing = somaTracingModel;
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
