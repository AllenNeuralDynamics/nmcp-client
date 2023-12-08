import {observable} from "mobx";

import {SearchScope} from "../../models/uiQueryPredicate";

export class SystemConfigurationStore {
    @observable searchScope: SearchScope;
    @observable systemVersion: string;
    @observable exportLimit: number;

    public constructor() {
        this.searchScope = SearchScope.Unset;
        this.systemVersion = "";
        this.exportLimit = 0;
    }

    public update(data: any) {
        this.searchScope = data.searchScope;
        this.systemVersion = data.systemVersion;
        this.exportLimit = data.exportLimit;
    }
}
