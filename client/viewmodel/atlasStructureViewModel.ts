import {makeObservable, observable} from "mobx";

import {AtlasStructureShape} from "../models/atlasStructure";

export class AtlasStructureViewModel {
    public structure: AtlasStructureShape;
    public children: AtlasStructureViewModel[];
    public isDisplayed: boolean;
    public isFavorite: boolean;
    public shouldIncludeInHistory: boolean;
    public shouldShowChildren: boolean;

    public constructor(structure: AtlasStructureShape) {
        this.structure = structure;
        this.children = [];
        this.isDisplayed = false;
        this.isFavorite = false;
        this.shouldIncludeInHistory = false;
        this.shouldShowChildren = false;

        makeObservable(this, {
            isDisplayed: observable,
            isFavorite: observable,
            shouldIncludeInHistory: observable,
            shouldShowChildren: observable
        });
    }

    public matches(str: string): boolean {
        let matches: boolean = this.structure.name.toLowerCase().includes(str);

        if (!matches) {
            matches = this.structure.acronym.toLowerCase().includes(str);
        }

        if (!matches && this.structure.aliasList?.length > 0) {
            matches = this.structure.aliasList.some(a => a.includes(str));
        }

        return matches;
    }
}
