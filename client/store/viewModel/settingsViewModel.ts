import {action, observable, makeObservable} from "mobx";

export class SettingsViewModel {
    public IsSettingsWindowOpen: boolean = false;

    constructor() {
        makeObservable(this, {IsSettingsWindowOpen: observable, openSettingsDialog: action, closeSettingsDialog: action});
    }

    public openSettingsDialog() {
        this.IsSettingsWindowOpen = true;
    }

    public closeSettingsDialog() {
        this.IsSettingsWindowOpen = false;
    }
}
