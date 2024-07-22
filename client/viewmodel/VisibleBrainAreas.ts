import {BrainCompartmentViewModel} from "./brainCompartmentViewModel";
import {NdbConstants} from "../models/constants";
import {IBrainArea} from "../models/brainArea";

const ROOT_ID = 997;


export class VisibleBrainAreas {

    private _constants: NdbConstants;
    private _brainAreasToDisplay: BrainCompartmentViewModel[] = [];
    private brainAreaViewModelMap = new Map<string, BrainCompartmentViewModel>();

    public get BrainAreas(): BrainCompartmentViewModel[] {
        return this._brainAreasToDisplay.slice();
    }

    public initialize(constants: NdbConstants): boolean {
        if (!constants) {
            return false;
        }

        this._constants = constants;

        this.createViewModel(this._constants.findBrainArea(ROOT_ID));

        return true;
    }

    public clear() {
        const brainArea = this._constants.findBrainArea(ROOT_ID);

        this.mutate([brainArea.id], this._brainAreasToDisplay.map(c => c.compartment.id).filter(id => id !== brainArea.id));
    }

    public show(ids: number[]) {
        // Clear everything and only show the specified areas except for root.
        this._brainAreasToDisplay.map(b => b.isDisplayed = b.compartment.structureId === ROOT_ID ? b.isDisplayed : false);

        const toAdd = ids.map(id => {
            const brainArea = this._constants.findBrainArea(id);

            return brainArea.id;
        });

        this.mutate(toAdd);
    }

    public mutate(added: string[], removed: string[] = []) {
        removed.map(id => {
            const viewModel = this.brainAreaViewModelMap.get(id);

            viewModel.isDisplayed = false;
        });

        added.map(id => {
            const {viewModel} = this.addIfNeeded(id);

            viewModel.isDisplayed = true;
            viewModel.shouldIncludeInHistory = true;
        });
    }

    public toggle(id: string) {
        let {viewModel, wasKnown} = this.addIfNeeded(id);

        if (wasKnown) {
            viewModel.isDisplayed = !viewModel.isDisplayed;
        } else {
            viewModel.isDisplayed = true;
        }

        // Anytime it is reactivated, put in history even if they have previously removed.
        if (viewModel.isDisplayed) {
            viewModel.shouldIncludeInHistory = true;
        }
    }

    private addIfNeeded(id: string) {
        let wasKnown = true;

        let viewModel = this.brainAreaViewModelMap.get(id);

        if (!viewModel) {
            const brainArea = this._constants.findBrainArea(id);

            viewModel = this.createViewModel(brainArea);

            wasKnown = false;
        }

        return {viewModel, wasKnown};
    }

    private createViewModel(brainArea: IBrainArea): BrainCompartmentViewModel {
        const viewModel = new BrainCompartmentViewModel(brainArea, true);

        this.brainAreaViewModelMap.set(brainArea.id, viewModel);

        this._brainAreasToDisplay.push(viewModel);

        return viewModel;
    }
}
