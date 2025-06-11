import {observable, makeObservable} from "mobx";

import {rootDataStore} from "../system/systemDataStore";
import {TomographyViewModel} from "./tomographyViewModel";
import {CompartmentHistoryViewModel} from "./compartmentHistoryViewModel";
import {SettingsViewModel} from "./settingsViewModel";
import {CompartmentsViewModel} from "./compartmentsViewModel";

export class SystemViewModel {
    Settings: SettingsViewModel;
    Tomography: TomographyViewModel;
    Compartments: CompartmentsViewModel;
    CompartmentHistory: CompartmentHistoryViewModel;

    constructor() {
        this.Settings = new SettingsViewModel();
        this.Tomography = new TomographyViewModel(rootDataStore.Tomography);
        this.Compartments = new CompartmentsViewModel();
        this.CompartmentHistory = new CompartmentHistoryViewModel();

        makeObservable(this, {
            Settings: observable,
            Tomography: observable,
            Compartments: observable,
            CompartmentHistory: observable,
        });
    }
}

export const rootViewModel: SystemViewModel = new SystemViewModel();
