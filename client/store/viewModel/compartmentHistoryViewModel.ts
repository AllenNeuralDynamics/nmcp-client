import {observable, makeObservable} from "mobx";

export class CompartmentHistoryViewModel {
    public IsVisible: boolean = true;

    public constructor() {
        makeObservable(this, {IsVisible: observable});
    }
}
