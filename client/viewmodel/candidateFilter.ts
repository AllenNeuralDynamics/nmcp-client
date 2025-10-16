import {action, makeObservable, observable} from "mobx";

import {IBrainArea} from "../models/brainArea";

export class CandidateFilter {
    public offset: number = 0;
    public limit: number = 10;
    public includeInProgress: boolean = false;
    public limitSamples: boolean = false;
    public sampleFilter: string[] = [];
    public limitBrainAreas: boolean = false;
    public brainAreaFilter: IBrainArea[] = [];
    public limitTags: boolean = false;
    public tagFilter: string = "";
    public limitBrightness: boolean = false;
    public brightnessOperator: string = "3";
    public brightness: number = 0;
    public limitVolume: boolean = false;
    public volumeOperator: string = "3";
    public volume: number = 0;

    public constructor() {
        makeObservable(this, {
            offset: observable,
            limit: observable,
            includeInProgress: observable,
            limitSamples: observable,
            sampleFilter: observable,
            limitBrainAreas: observable,
            brainAreaFilter: observable,
            limitTags: observable,
            tagFilter: observable,
            limitBrightness: observable,
            brightnessOperator: observable,
            brightness: observable,
            limitVolume: observable,
            volumeOperator: observable,
            volume: observable,
            setBrightness: action,
            setVolume: action
        });
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
}
