import {action, computed, makeObservable, observable} from "mobx";

import {AtlasStructureViewModel} from "./atlasStructureViewModel";
import {AtlasStructureShape} from "../models/atlasStructure";
import {Atlas} from "../models/atlas";
import {AtlasKindId} from "../models/atlasKind";

// CCFv3 retina and grooves are hidden from the tree until the API supplies exclusions; applied to Mouse atlases only.
const MouseExcludedStructureIds = [304325711, 1024];

export class AtlasViewModel {
    public readonly atlas: Atlas;

    public structures: AtlasStructureViewModel[] = [];

    public rootStructure: AtlasStructureViewModel = null;

    private _structureMap: Map<string, AtlasStructureViewModel> = new Map<string, AtlasStructureViewModel>();

    public constructor(atlas: Atlas) {
        this.atlas = atlas;

        this.buildTree();

        makeObservable(this, {
            structures: observable,
            rootStructure: observable.ref,
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

    public clear() {
        this.structures.forEach(s => s.isDisplayed = false);

        if (this.rootStructure?.structure.hasGeometry) {
            this.rootStructure.isDisplayed = true;
        }
    }

    public mutate(added: string[], removed: string[] = []) {
        removed.map(id => {
            const viewModel = this.findDisplayable(id);

            if (viewModel) {
                viewModel.isDisplayed = false;
            }
        });

        added.map(id => {
            const viewModel = this.findDisplayable(id);

            if (viewModel) {
                viewModel.isDisplayed = true;
                // Anytime it is reactivated, put in history even if they have previously removed.
                viewModel.shouldIncludeInHistory = true;
            }
        });
    }

    public toggle(id: string) {
        const viewModel = this.findDisplayable(id);

        if (!viewModel) {
            return;
        }

        viewModel.isDisplayed = !viewModel.isDisplayed;

        // Anytime it is reactivated, put in history even if they have previously removed.
        if (viewModel.isDisplayed) {
            viewModel.shouldIncludeInHistory = true;
        }
    }

    // Missing for an excluded structure or another atlas's structure. Only the root can lack geometry, and a root
    // without geometry has nothing to draw.
    private findDisplayable(id: string): AtlasStructureViewModel | undefined {
        const viewModel = this._structureMap.get(id);

        return viewModel?.structure.hasGeometry ? viewModel : undefined;
    }

    private buildTree() {
        const atlas = this.atlas;

        const excluded = atlas.atlasKind?.kind === AtlasKindId.Mouse ? MouseExcludedStructureIds : [];

        const structureIdMap = new Map<number, AtlasStructureViewModel>();

        const root = atlas.findStructure(atlas.rootStructureId);

        if (root) {
            this.rootStructure = this.create(root);
            this.rootStructure.shouldShowChildren = true;
            this.rootStructure.isDisplayed = root.hasGeometry;

            structureIdMap.set(root.structureId, this.rootStructure);
        }

        // Depth-sorted, so every ancestor is registered before its descendants.
        atlas.StructuresWithGeometry.forEach(s => {
            if (s.structureId === atlas.rootStructureId || excluded.includes(s.structureId)) {
                return;
            }

            const viewModel = this.create(s);

            structureIdMap.set(s.structureId, viewModel);

            const parent = this.findAncestor(s, structureIdMap) ?? this.rootStructure;

            parent?.children.push(viewModel);
        });
    }

    private findAncestor(structure: AtlasStructureShape, structureIdMap: Map<number, AtlasStructureViewModel>): AtlasStructureViewModel | undefined {
        let parent = this.atlas.findStructure(structure.parentStructureId);

        while (parent) {
            const viewModel = structureIdMap.get(parent.structureId);

            if (viewModel) {
                return viewModel;
            }

            parent = this.atlas.findStructure(parent.parentStructureId);
        }

        return undefined;
    }

    private create(structure: AtlasStructureShape): AtlasStructureViewModel {
        const viewModel = new AtlasStructureViewModel(structure);

        this.structures.push(viewModel);

        this._structureMap.set(structure.id, viewModel);

        return viewModel;
    }
}
