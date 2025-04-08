import {INeuron} from "../models/neuron";
import {
    NEURON_VIEW_MODE_ALL, NEURON_VIEW_MODE_AXON, NEURON_VIEW_MODE_DENDRITE, NEURON_VIEW_MODE_SOMA, NeuronViewMode
} from "./neuronViewMode";
import {TracingViewModel} from "./tracingViewModel";
import {TracingStructure} from "../models/tracingStructure";
import {IReconstruction} from "../models/reconstruction";

export class NeuronViewModel {
    neuron: INeuron;

    toggleViewMode: NeuronViewMode;

    isSelected: boolean;
    isInHighlightList: boolean;

    baseColor: string;

    mirror: boolean;

    hasAxonTracing: boolean;
    hasDendriteTracing: boolean;

    somaOnlyTracing: TracingViewModel;
    tracings: TracingViewModel[];

    private readonly reconstruction: IReconstruction = null;

    private viewMode: NeuronViewMode;
    private requestedViewMode: NeuronViewMode | null;

    public constructor(neuron: INeuron, color: string | null = null) {
        this.neuron = neuron;

        this.viewMode = NEURON_VIEW_MODE_ALL;
        this.requestedViewMode = null;
        this.toggleViewMode = NEURON_VIEW_MODE_ALL;

        this.isSelected = false;
        this.isInHighlightList = false;

        this.baseColor = color || "#000000";

        this.mirror = false;

        this.hasAxonTracing = false;
        this.hasDendriteTracing = false;

        this.somaOnlyTracing = null;
        this.tracings = []

        if (this.neuron.reconstructions?.length > 0) {
            this.reconstruction = this.neuron.reconstructions[0]
        }
    }

    public get Id() {
        return this.neuron.id;
    }

    public get Reconstruction() {
        return this.reconstruction;
    }

    public get RequestedViewMode() {
        return this.requestedViewMode;
    }

    public get SkeletonSegmentId() {
        return this.reconstruction?.precomputed?.skeletonSegmentId;
    }

    public get ViewMode() {
        return this.requestedViewMode || this.viewMode;
    }

    public get CurrentViewMode() {
        return this.viewMode;
    }

    public requestViewMode(mode: TracingStructure) {
        switch (mode) {
            case TracingStructure.all:
                if (this.hasAxonTracing) {
                    if (this.hasDendriteTracing) {
                        this.requestedViewMode = NEURON_VIEW_MODE_ALL;
                    } else {
                        this.requestedViewMode = NEURON_VIEW_MODE_AXON;
                    }
                } else if (this.hasDendriteTracing) {
                    this.requestedViewMode = NEURON_VIEW_MODE_DENDRITE;
                } else {
                    this.requestedViewMode = NEURON_VIEW_MODE_SOMA;
                }
                break;
            case TracingStructure.axon:
                if (!this.hasAxonTracing) {
                    this.requestedViewMode = NEURON_VIEW_MODE_SOMA;
                } else {
                    this.requestedViewMode = NEURON_VIEW_MODE_AXON;
                }
                break;
            case TracingStructure.dendrite:
                if (!this.hasDendriteTracing) {
                    this.requestedViewMode = NEURON_VIEW_MODE_SOMA;
                } else {
                    this.requestedViewMode = NEURON_VIEW_MODE_DENDRITE;
                }
                break;
            case TracingStructure.soma:
                // Can always grant immediately - it comes with the neuron data itself.
                this.viewMode = NEURON_VIEW_MODE_SOMA;
                this.requestedViewMode = null;
                break;
        }
    }

    public completedViewModeRequest() {
        if (this.requestedViewMode !== null) {
            this.viewMode = this.requestedViewMode;
            this.requestedViewMode = null;
        }
    }

    public cancelRequestedViewMode() {
        this.requestedViewMode = null;
    }
}
