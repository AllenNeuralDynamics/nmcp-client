import {makeAutoObservable} from "mobx";

import {AtlasStructureShape} from "../models/atlasStructure";
import {SomaFilterProperties} from "../models/neuron";

export class OptionalFilter<T> {
    public isEnabled: boolean = false;
    public contents?: T = null;

    public constructor(initialContents: T = null, isEnabled: boolean = false) {
        this.contents = initialContents;
        this.isEnabled = isEnabled;

        makeAutoObservable(this);
    }
}

export class CandidateFilter {
    public includeInProgress: boolean = false;

    public samplesFilter: OptionalFilter<string[]> = new OptionalFilter([]);
    public atlasStructureFilter: OptionalFilter<AtlasStructureShape[]> = new OptionalFilter([]);
    public tagFilter: OptionalFilter<string> = new OptionalFilter("");
    public limitBrightness: boolean = false;
    public brightnessOperator: string = "3";
    public brightness: number = 0;
    public limitVolume: boolean = false;
    public volumeOperator: string = "3";
    public volume: number = 0;

    public constructor() {
        makeAutoObservable(this);
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

    public get anyEnabled(): boolean {
        return this.includeInProgress || this.samplesFilter.isEnabled || this.atlasStructureFilter.isEnabled || this.tagFilter.isEnabled || this.limitBrightness || this.limitVolume
    }

    public get specimenIds(): string[] {
        return this.samplesFilter.isEnabled ? this.samplesFilter.contents : [];
    }

    public get atlasStructureIds(): string[] {
        return this.atlasStructureFilter.isEnabled ? this.atlasStructureFilter.contents.map(b => b.id) : [];
    }

    public get keywords(): string[] {
        return this.tagFilter.isEnabled && this.tagFilter.contents.trim().length > 0 ? [this.tagFilter.contents] : [];
    }

    public get somaFilter(): SomaFilterProperties {
        const input: any = {};

        if (this.limitBrightness) {
            input.brightnessOperator = parseInt(this.brightnessOperator);
            input.brightness = this.brightness;
        }

        if (this.limitVolume) {
            input.volumeOperator = parseInt(this.volumeOperator);
            input.volume = this.volume;
        }

        return input;
    }
}
