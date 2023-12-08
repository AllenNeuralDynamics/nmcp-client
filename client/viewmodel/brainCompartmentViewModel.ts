import {IBrainArea} from "../models/brainArea";

export class BrainCompartmentViewModel {
    compartment: IBrainArea;
    isDisplayed: boolean;
    shouldIncludeInHistory: boolean;
    isFavorite: boolean;

    public constructor(neuron: IBrainArea, isSelected: boolean = true) {
        this.compartment = neuron;
        this.isDisplayed = isSelected;
        this.shouldIncludeInHistory = true;
        this.isFavorite = false;
    }
}
