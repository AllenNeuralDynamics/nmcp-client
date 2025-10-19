import {makeObservable, observable} from "mobx";

import {NeuronShape} from "../models/neuron";
import {NEURON_VIEW_MODE_ALL, NeuronViewMode} from "./neuronViewMode";
import {AtlasNode} from "../models/atlasNode";

export class NeuronViewModel {
    neuron: NeuronShape = null;

    isSelected: boolean = true;

    baseColor: string = "#000000";

    mirror: boolean = false;

    soma: AtlasNode = null;

    viewMode: NeuronViewMode;

    private readonly reconstructionId: string = null;
    private readonly skeletonId: number = null;

    public constructor(neuron: NeuronShape, color: string | null = null) {
        this.neuron = neuron;

        this.viewMode = NEURON_VIEW_MODE_ALL;

        this.isSelected = false;

        this.baseColor = color || "#000000";

        this.mirror = false;

        this.soma = neuron.published.soma;

        this.reconstructionId = this.neuron.published.id;
        this.skeletonId = this.neuron.published.precomputed.skeletonId;

        makeObservable(this, {
            viewMode: observable,
            isSelected: observable,
            baseColor: observable,
            mirror: observable
        })
    }

    public get Label(): string {
        return this.neuron.label;
    }

    /**
     * A reference to the registered (e.g., CCF-space) reconstruction (not the specimen-space source reconstruction).
     * @constructor
     */
    public get ReconstructionId(): string {
        return this.reconstructionId;
    }

    public get SkeletonSegmentId(): number {
        return this.skeletonId;
    }
}
