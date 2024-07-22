import {action, observable} from "mobx";

export class SettingsViewModel {
    @observable public IsSettingsWindowOpen: boolean = false;

    @action
    public openSettingsDialog() {
        this.IsSettingsWindowOpen = true;
    }

    @action
    public closeSettingsDialog() {
        this.IsSettingsWindowOpen = false;
    }
}
