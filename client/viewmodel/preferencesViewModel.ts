import {action, observable, makeObservable} from "mobx";

import {UserPreferences} from "../util/userPreferences";

export class PreferencesViewModel {
    public isPreferencesWindowOpen: boolean = false;

    public preferences: UserPreferences = null;

    constructor() {
        this.preferences = UserPreferences.Instance;

        makeObservable(this, {
            preferences: observable,
            isPreferencesWindowOpen: observable,
            openSettingsDialog: action,
            closeSettingsDialog: action
        });
    }

    public openSettingsDialog() {
        this.isPreferencesWindowOpen = true;
    }

    public closeSettingsDialog() {
        this.isPreferencesWindowOpen = false;
    }
}
