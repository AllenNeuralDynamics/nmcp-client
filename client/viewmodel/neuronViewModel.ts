import {action, makeObservable, observable} from "mobx";

import {NeuronShape} from "../models/neuron";
import {getViewMode, NEURON_VIEW_MODE_ALL, NeuronViewMode} from "./neuronViewMode";
import {AtlasNode} from "../models/atlasNode";

export type NeuronViewModelState = {
    neuronId: string;
    baseColor: string;
    viewModeId: string;
    isSelected: boolean;
    isMirrored: boolean;
}

export class NeuronViewModel {
    neuron: NeuronShape = null;

    isSelected: boolean = true;

    baseColor: string = "#000000";

    isMirrored: boolean = false;

    soma: AtlasNode = null;

    viewMode: NeuronViewMode;

    private readonly reconstructionId: string = null;
    private readonly skeletonId: number = null;

    public constructor(neuron: NeuronShape, color: string | null = null) {
        this.neuron = neuron;

        this.viewMode = NEURON_VIEW_MODE_ALL;

        this.isSelected = false;

        this.baseColor = color || "#000000";

        this.isMirrored = false;

        this.soma = neuron.published.soma;

        this.reconstructionId = this.neuron.published.id;
        this.skeletonId = this.neuron.published.precomputed.skeletonId;

        makeObservable(this, {
            viewMode: observable,
            isSelected: observable,
            baseColor: observable,
            isMirrored: observable,
            deserialize: action
        });
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

    public serialize(): NeuronViewModelState {
        return {
            neuronId: this.neuron.id,
            baseColor: this.baseColor,
            viewModeId: this.viewMode.id,
            isSelected: this.isSelected,
            isMirrored: this.isMirrored
        }
    }

    public deserialize(state: NeuronViewModelState): void {
        if (this.neuron.id != state.neuronId) {
            return;
        }

        this.baseColor = state.baseColor;
        this.viewMode = getViewMode(state.viewModeId);
        this.isSelected  = state.isSelected;
        this.isMirrored = state.isMirrored;
    }
}
