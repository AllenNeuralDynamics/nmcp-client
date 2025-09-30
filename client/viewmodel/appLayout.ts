import {makeObservable, observable} from "mobx";

export class AppLayout {
    public isAtlasStructureHistoryExpanded: boolean = true;

    public constructor() {
        makeObservable(this, {
            isAtlasStructureHistoryExpanded: observable
        });
    }
}
