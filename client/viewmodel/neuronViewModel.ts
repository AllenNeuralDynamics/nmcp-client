import {action, makeObservable, observable} from "mobx";

import {NeuronShape} from "../models/neuron";
import {getViewMode, NEURON_VIEW_MODE_ALL, NeuronViewMode} from "./neuronViewMode";
import {AtlasNode} from "../models/atlasNode";

// Fields still at the value a neuron enters the results with are left out (see NeuronViewModel.serialize).
export type NeuronViewModelState = {
    neuronId: string;
    baseColor: string;
    viewModeId?: string;
    isSelected?: boolean;
    isMirrored?: boolean;
}

const DefaultIsSelected = true;
const DefaultIsMirrored = false;

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

        this.isSelected = DefaultIsSelected;

        this.baseColor = color || "#000000";

        this.isMirrored = DefaultIsMirrored;

        this.soma = neuron.published.atlasReconstruction.soma;

        this.reconstructionId = this.neuron.published.atlasReconstruction.id;
        this.skeletonId = this.neuron.published.atlasReconstruction.precomputed.skeletonId;

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

    // The base color is always kept: it comes from the order neurons first appeared in this session's results, which a
    // restoring page does not share.
    public serialize(): NeuronViewModelState {
        const state: NeuronViewModelState = {
            neuronId: this.neuron.id,
            baseColor: this.baseColor
        };

        if (this.viewMode.id != NEURON_VIEW_MODE_ALL.id) {
            state.viewModeId = this.viewMode.id;
        }

        if (this.isSelected != DefaultIsSelected) {
            state.isSelected = this.isSelected;
        }

        if (this.isMirrored != DefaultIsMirrored) {
            state.isMirrored = this.isMirrored;
        }

        return state;
    }

    public deserialize(state: NeuronViewModelState): void {
        if (this.neuron.id != state.neuronId) {
            return;
        }

        this.baseColor = state.baseColor ?? this.baseColor;
        this.viewMode = (state.viewModeId ? getViewMode(state.viewModeId) : null) ?? NEURON_VIEW_MODE_ALL;
        this.isSelected = state.isSelected ?? DefaultIsSelected;
        this.isMirrored = state.isMirrored ?? DefaultIsMirrored;
    }
}
