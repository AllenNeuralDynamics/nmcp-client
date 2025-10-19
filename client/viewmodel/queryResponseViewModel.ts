import {action, computed, makeAutoObservable, makeObservable, observable} from "mobx";

import {jet} from "../util/colors";
import {NeuronShape} from "../models/neuron";
import {NeuronViewModel} from "./neuronViewModel";
import {NEURON_VIEW_MODE_ALL, NeuronViewMode} from "./neuronViewMode";
import {isNullOrUndefined} from "../util/nodeUtil";

export enum QueryStatus {
    NeverQueried,
    Loading,
    Loaded
}

export class QueryResponseViewModel {
    public queryNonce: string = null;

    public isPending: boolean = false;

    public queryTime: number = -1;

    public neurons: NeuronShape[] = [];

    public matchCount: number = 0;

    public totalCount: number = NaN;

    public queryError: Error = null;

    public neuronViewModels: NeuronViewModel[] = [];

    public defaultNeuronViewMode: NeuronViewMode = NEURON_VIEW_MODE_ALL;

    private _neuronViewModelMap = new Map<string, NeuronViewModel>();

    private _nextColorIndex = 0;

    public constructor() {
        makeAutoObservable(this, {
            queryNonce: observable,
            isPending: observable,
            queryTime: observable,
            neurons: observable,
            matchCount: observable,
            totalCount: observable,
            queryError: observable,
            neuronViewModels: observable,
            defaultNeuronViewMode: observable,
            setDefaultNeuronViewMode: action,
            reset: action,
            initiate: action,
            update: action,
            errored: action,
            status: computed,
            resetColors: action,
            areAllNeuronsSelected: computed,
            neuronsSameColor: computed
        });

        this.reset();
    }

    public get status(): QueryStatus {
        return this.isPending ? QueryStatus.Loading : (this.totalCount >= 0 ? QueryStatus.Loaded : QueryStatus.NeverQueried);
    }

    reset() {
        this.isPending = false;
        this.queryTime = -1;
        this.queryNonce = null;
        this.neurons = [];
        this.matchCount = 0;
        this.totalCount = NaN;
        this.queryError = null;
        this.neuronViewModels = [];
    }

    initiate(nonce: string) {
        this.reset();

        this.isPending = true;
        this.queryNonce = nonce;
        this._nextColorIndex = 0;
    }

    update(time: number, neurons: NeuronShape[], totalCount: number) {
        this.isPending = false;
        this.queryTime = time;
        this.neurons = neurons;
        this.matchCount = neurons.length;
        this.totalCount = totalCount;

        this.updateViewModels();
    }

    errored(error: Error) {
        this.isPending = false;
        this.queryError = error;
    }

    public get areAllNeuronsSelected(): boolean {
        return this.neuronViewModels.every(v => v.isSelected);
    }

    public set areAllNeuronsSelected(b: boolean) {
        this.neuronViewModels.forEach(v => v.isSelected = b);
    }

    public get neuronsSameColor(): string {
        const selected = this.neuronViewModels.filter(v => v.isSelected);

        if (selected.length < 2) {
            return null;
        }

        const sameColor = selected[0].baseColor;

        return selected.filter(v => v.isSelected).every(v => v.baseColor == sameColor) ? sameColor : null;
    }

    public set neuronsSameColor(color: string) {
        this.neuronViewModels.filter(v => v.isSelected).forEach(v => v.baseColor = color);
    }

    public resetColors(): void {
        this._nextColorIndex = 0;

        for (const v of this.neuronViewModels) {
            v.baseColor = jet[this._nextColorIndex++ % jet.length];
        }
    }

    public setDefaultNeuronViewMode(mode: NeuronViewMode) {
        if (!isNullOrUndefined(mode)) {
            this.defaultNeuronViewMode = mode;
            this.neuronViewModels.forEach(v => v.viewMode = mode);
        }
    }

    private updateViewModels() {
        this.neuronViewModels = [];

        this.neurons.map((neuron) => {
            let viewModel = this._neuronViewModelMap.get(neuron.id);

            if (!viewModel) {
                const color = jet[this._nextColorIndex++ % jet.length];

                viewModel = new NeuronViewModel(neuron, color);

                this._neuronViewModelMap.set(neuron.id, viewModel);

                viewModel.viewMode = NEURON_VIEW_MODE_ALL;
                viewModel.isSelected = true;
            }

            this.neuronViewModels.push(viewModel);
        });
    }
}
