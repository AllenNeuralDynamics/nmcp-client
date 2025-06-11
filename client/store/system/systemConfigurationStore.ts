import {observable, makeObservable} from "mobx";

export class SystemConfigurationStore {
    systemVersion: string;
    exportLimit: number;

    public constructor() {
        this.systemVersion = "";
        this.exportLimit = 0;

        makeObservable(this, {
            systemVersion: observable,
            exportLimit: observable,
        });
    }

    public update(data: any) {
        this.systemVersion = data.systemVersion;
        this.exportLimit = data.exportLimit;
    }
}
