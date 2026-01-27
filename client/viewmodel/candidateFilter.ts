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
    public brightnessRange: [number, number] = [0, 1000];
    public limitVolume: boolean = false;
    public volumeRange: [number, number] = [0, 1000];

    public constructor() {
        makeAutoObservable(this);
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

        input.limitBrightness = this.limitBrightness;
        input.brightnessRange = this.brightnessRange;

        input.limitVolume = this.limitVolume;
        input.volumeRange = this.volumeRange;

        return input;
    }
}
