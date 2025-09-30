import {observable, makeObservable} from "mobx";

export class SystemConfiguration {
    systemVersion: string;
    precomputedLocation: string;
    exportLimit: number;

    public constructor() {
        this.systemVersion = "";
        this.precomputedLocation = "";
        this.exportLimit = 0;

        makeObservable(this, {
            systemVersion: observable,
            precomputedLocation: observable,
            exportLimit: observable,
        });
    }

    public update(data: any) {
        this.systemVersion = data.systemVersion;
        this.precomputedLocation = data.precomputedLocation;
        this.exportLimit = data.exportLimit;
    }
}
