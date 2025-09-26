import {observable, makeObservable} from "mobx";

import {CompartmentHistoryViewModel} from "./compartmentHistoryViewModel";
import {SettingsViewModel} from "./settingsViewModel";
import {CompartmentsViewModel} from "./compartmentsViewModel";

export class SystemViewModel {
    Settings: SettingsViewModel;
    Compartments: CompartmentsViewModel;
    CompartmentHistory: CompartmentHistoryViewModel;

    constructor() {
        this.Settings = new SettingsViewModel();
        this.Compartments = new CompartmentsViewModel();
        this.CompartmentHistory = new CompartmentHistoryViewModel();

        makeObservable(this, {
            Settings: observable,
            Compartments: observable,
            CompartmentHistory: observable,
        });
    }
}

export const systemViewModel: SystemViewModel = new SystemViewModel();
