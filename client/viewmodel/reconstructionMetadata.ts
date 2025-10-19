import {makeAutoObservable} from "mobx";
import {Reconstruction} from "../models/reconstruction";

export class ReconstructionMetadata {
    public duration: number = 0;
    public notes: string = "";
    public startedAt: Date = null;
    public completedAt: Date = null;

    private readonly initDuration: number;
    private readonly initNotes: string;
    private readonly initStartedAt: Date;
    private readonly initCompletedAt: Date;

    public constructor(reconstruction: Reconstruction = null) {
        if (reconstruction) {
            this.duration = this.initDuration = reconstruction.durationHours;
            this.notes = this.initNotes = reconstruction.notes ?? "";
            this.startedAt = this.initStartedAt = reconstruction.startedAt;
            this.completedAt = this.initCompletedAt = reconstruction.completedAt;
        }

        makeAutoObservable(this);
    }

    public setDuration(value: number | string) {
        if (typeof value === "string") {
            if (value?.trim().length == 0) {
                this.duration = null;
            } else {
                const num = parseFloat(value);
                if (!isNaN(num)) {
                    this.duration = num;
                }
            }
        } else {
            this.duration = value;
        }
    }

    public isModified(): boolean {
        return this.duration != this.initDuration
            || this.notes != this.initNotes
            || this.startedAt?.valueOf() != this.initStartedAt?.valueOf()
            || this.completedAt?.valueOf() != this.initCompletedAt?.valueOf();
    }

    public modifiedJSON(): object {
        const modified = {};

        if (this.duration != this.initDuration) {
            modified["duration"] = this.duration;
        }

        if (this.notes != this.initNotes) {
            modified["notes"] = this.notes;
        }

        if (this.startedAt != this.initStartedAt) {
            modified["started"] = this.startedAt;
        }

        if (this.completedAt != this.initCompletedAt) {
            modified["completed"] = this.completedAt;
        }

        return modified;
    }
}
