import {makeObservable, observable} from "mobx";

import {SystemConfigurationStore} from "./systemConfigurationStore";
import {TomographyCollection} from "./tomographyCollection";
import {NdbConstants} from "../../models/constants";

export class SystemDataStore {
    public SystemConfiguration: SystemConfigurationStore = new SystemConfigurationStore();

    public Tomography: TomographyCollection = new TomographyCollection();

    public Constants: NdbConstants = NdbConstants.DefaultConstants;

    public constructor() {
        makeObservable(this, {SystemConfiguration: observable, Tomography: observable});
    }
}

export const rootDataStore: SystemDataStore = new SystemDataStore();
