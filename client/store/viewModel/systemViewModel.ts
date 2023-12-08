import {observable} from "mobx";

import {rootDataStore} from "../system/systemDataStore";
import {TomographyViewModel} from "./tomographyViewModel";
import {CompartmentHistoryViewModel} from "./compartmentHistoryViewModel";
import {SettingsViewModel} from "./settingsViewModel";
import {CompartmentsViewModel} from "./compartmentsViewModel";

export class SystemViewModel {
    @observable Settings: SettingsViewModel = new SettingsViewModel();

    @observable Tomography: TomographyViewModel = new TomographyViewModel(rootDataStore.Tomography);

    // Currently only used for mesh version.
    @observable Compartments: CompartmentsViewModel = new CompartmentsViewModel();

    // Currently only used for collapse/expand of the history panel itself.
    @observable CompartmentHistory: CompartmentHistoryViewModel = new CompartmentHistoryViewModel();
}

export const rootViewModel: SystemViewModel = new SystemViewModel();
