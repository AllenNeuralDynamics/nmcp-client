import {makeAutoObservable} from "mobx";

export class ImportSomaData {
    public somaFile: File = null;
    public applyKeywords: boolean = false;
    public keywords: string = "";
    public shouldLookupAtlasStructures: boolean = true;
    public brightness: number = 0;
    public volume: number = 0;
    public importError: string = null;

    public constructor() {
        makeAutoObservable(this);
    }

    public get canImport(): boolean {
        return this.somaFile != null;
    }

    public setBrightness(value: any) {
        const v = this.parseValue(value);

        if (!isNaN(v)) {
            this.brightness = v;
        }
    }

    public setVolume(value: any) {
        const v = this.parseValue(value);

        if (!isNaN(v)) {
            this.volume = v;
        }
    }

    private parseValue(value: any) {
        let v: number;
        if (typeof value === "string") {
            v = parseFloat(value);
        } else {
            v = value;
        }

        return v;
    }

    public async readFeaturesFile(file: File): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();

                reader.onload = ((data: ProgressEvent) => {
                    if (data.loaded === data.total) {
                        let missing = false;

                        try {
                            const obj = JSON.parse(reader.result as string);

                            if ("Brightness" in obj) {
                                this.brightness = obj["Brightness"];
                            } else {
                                missing = true;
                            }

                            if ("Volume" in obj) {
                                this.volume = obj["Volume"];
                            } else {
                                missing = true;
                            }

                            resolve(!missing);
                        } catch (error) {
                            console.error(error);
                            resolve(false);
                        }
                    }
                });

                reader.readAsText(file);
            } catch (error) {
                console.error(error);
                resolve(false);
            }
        });
    }
}
