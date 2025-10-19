import {action, computed, makeObservable, observable} from "mobx";

import {AtlasStructureViewModel} from "./atlasStructureViewModel";
import {AtlasConstants, DataConstants} from "../models/constants";
import {AtlasStructureShape} from "../models/atlasStructure";

const ROOT_ID = 997;
const RETINA = 304325711;
const GROOVES = 1024;

export class AtlasViewModel {
    public structures: AtlasStructureViewModel[] = [];

    public rootStructure: AtlasStructureViewModel;

    private _structureMap: Map<string, AtlasStructureViewModel> = new Map<string, AtlasStructureViewModel>();

    public constructor() {
        makeObservable(this, {
            structures: observable,
            initialize: action,
            clear: action,
            mutate: action,
            toggle: action,
            displayedStructures: computed,
            structureHistory: computed
        });
    }

    public get displayedStructures(): AtlasStructureViewModel[] {
        return this.structures.filter(s => s.isDisplayed);
    }

    public get structureHistory(): AtlasStructureViewModel[] {
        return this.structures.filter(s => s.shouldIncludeInHistory);
    }

    public initialize(constants: AtlasConstants) {
        if (this.rootStructure) {
            return;
        }

        const structures = constants.StructuresWithGeometry;

        const structureIdMap = new Map<number, AtlasStructureViewModel>();

        structures.forEach((s) => {
            if (s.structureId === RETINA || s.structureId === GROOVES) {
                return;
            }

            const viewModel = this.create(s);

            structureIdMap.set(s.structureId, viewModel);

            const parent = structureIdMap.get(s.parentStructureId);

            if (parent) {
                parent.children.push(viewModel);
            }
        });

        this.rootStructure = structureIdMap.get(ROOT_ID);
        this.rootStructure.isDisplayed = true;
        this.rootStructure.shouldShowChildren = true;
    }

    public clear() {
        this.structures.forEach(s => s.isDisplayed = false);

        this.rootStructure.isDisplayed = true;
    }

    public mutate(added: string[], removed: string[] = []) {
        removed.map(id => {
            const viewModel = this._structureMap.get(id);

            viewModel.isDisplayed = false;
        });

        added.map(id => {
            const viewModel = this._structureMap.get(id);

            viewModel.isDisplayed = true;
            // Anytime it is reactivated, put in history even if they have previously removed.
            viewModel.shouldIncludeInHistory = true;
        });
    }

    public toggle(id: string) {
        const viewModel = this._structureMap.get(id);


        viewModel.isDisplayed = !viewModel.isDisplayed;

        // Anytime it is reactivated, put in history even if they have previously removed.
        if (viewModel.isDisplayed) {
            viewModel.shouldIncludeInHistory = true;
        }
    }

    private create(structure: AtlasStructureShape): AtlasStructureViewModel {
        const viewModel = new AtlasStructureViewModel(structure);

        this.structures.push(viewModel);

        this._structureMap.set(structure.id, viewModel);

        return viewModel;
    }
}
