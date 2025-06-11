import {observable, computed, action, makeObservable} from "mobx";

import {ApiTomographyPlaneExtents, ApiSampleTomography} from "../../graphql/tomography";
import {Point3D, Range2D} from "../../util/viewerTypes";

const ReferenceTomographyId = "64f40090-1e7f-411e-bed1-497060dbd2be";

export class TomographyPlaneExtents {
    public readonly Horizontal: Range2D;
    public readonly Sagittal: Range2D;
    public readonly Coronal: Range2D;

    public constructor(limits: ApiTomographyPlaneExtents) {
        this.Horizontal = limits.horizontal;
        this.Sagittal = limits.sagittal;
        this.Coronal = limits.coronal;

        makeObservable(this, {
            Horizontal: observable,
            Sagittal: observable,
            Coronal: observable,
        });
    }
}

export class Threshold {
    public Min = 0;
    public Max = 1;

    public constructor(min: number, max: number) {
        makeObservable(this, {Min: observable, Max: observable, Values: computed});
        this.Min = min;
        this.Max = max;
    }

    public get Values(): [number, number] {
        return [this.Min.valueOf(), this.Max.valueOf()];
    }
}

export class SampleTomography {
    public Id: string;
    public Name: string;
    public Origin: Point3D;
    public PixelSize: Point3D;
    public DefaultThreshold: Threshold;
    public Limits: TomographyPlaneExtents;
    public readonly IsReferenceTomography: boolean;

    public constructor(tomography: ApiSampleTomography) {
        this.Id = tomography.id;
        this.Name = tomography.name;
        this.Origin = tomography.origin;
        this.PixelSize = tomography.pixelSize;
        this.DefaultThreshold = new Threshold(...tomography.threshold);
        this.Limits = new TomographyPlaneExtents(tomography.limits);

        this.IsReferenceTomography = this.Id === ReferenceTomographyId;

        makeObservable(this, {
            Id: observable,
            Name: observable,
            Origin: observable,
            PixelSize: observable,
            DefaultThreshold: observable,
            Limits: observable,
            IsReferenceTomography: observable,
        });
    }
}

export class TomographyCollection {
    public SampleTomographyMap: Map<string, SampleTomography> = new Map<string, SampleTomography>();

    _referenceTomography: SampleTomography = null;

    public constructor() {
        makeObservable(this, {SampleTomographyMap: observable, _referenceTomography: observable, ReferenceTomography: computed, fromSource: action})
    }

    public get ReferenceTomography(): SampleTomography | null {
        return this._referenceTomography;
    }

    public fromSource(tomography: ApiSampleTomography[]) {
        this.SampleTomographyMap = observable.map(new Map<string, SampleTomography>());

        tomography.forEach(t => {
            const sampleTomography = new SampleTomography(t);

            this.SampleTomographyMap.set(t.id, sampleTomography);

            if (sampleTomography.IsReferenceTomography) {
                this._referenceTomography = sampleTomography;
            }
        });
    }
}
