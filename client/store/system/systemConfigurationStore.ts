import {observable} from "mobx";

export class SystemConfigurationStore  {
    @observable systemVersion: string;
    @observable exportLimit: number;

    public constructor() {
        this.systemVersion = "";
        this.exportLimit = 0;
    }

    public update(data: any) {
        this.systemVersion = data.systemVersion;
        this.exportLimit = data.exportLimit;
    }
}
