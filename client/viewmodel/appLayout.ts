import {makeObservable, observable} from "mobx";

export class AppLayout {
    public isQueryExpanded: boolean = true;

    public isAtlasStructureHistoryExpanded: boolean = true;

    public constructor() {
        makeObservable(this, {
            isQueryExpanded: observable,
            isAtlasStructureHistoryExpanded: observable
        });
    }
}
