import {action, computed, observable} from "mobx";

import {ApiTomographyPlaneExtents, ApiSampleTomography} from "../../graphql/tomography";
import {Point3D, Range2D} from "../../util/viewerTypes";

const ReferenceTomographyId = "64f40090-1e7f-411e-bed1-497060dbd2be";

export class TomographyPlaneExtents {
    @observable public readonly Horizontal: Range2D;
    @observable public readonly Sagittal: Range2D;
    @observable public readonly Coronal: Range2D;

    public constructor(limits: ApiTomographyPlaneExtents) {
        this.Horizontal = limits.horizontal;
        this.Sagittal = limits.sagittal;
        this.Coronal = limits.coronal;
    }
}

export class Threshold {
    @observable public Min = 0;
    @observable public Max = 1;

    public constructor(min: number, max: number) {
        this.Min = min;
        this.Max = max;
    }

    @computed
    public get Values(): [number, number] {
        return [this.Min.valueOf(), this.Max.valueOf()];
    }
}

export class SampleTomography {
    @observable public Id: string;
    @observable public Name: string;
    @observable public Origin: Point3D;
    @observable public PixelSize: Point3D;
    @observable public DefaultThreshold: Threshold;
    @observable public Limits: TomographyPlaneExtents;

    @observable public readonly IsReferenceTomography: boolean;

    public constructor(tomography: ApiSampleTomography) {
        this.Id = tomography.id;
        this.Name = tomography.name;
        this.Origin = tomography.origin;
        this.PixelSize = tomography.pixelSize;
        this.DefaultThreshold = new Threshold(...tomography.threshold);
        this.Limits = new TomographyPlaneExtents(tomography.limits);

        this.IsReferenceTomography = this.Id === ReferenceTomographyId;
    }
}

export class TomographyCollection {
    @observable public SampleTomographyMap: Map<string, SampleTomography> = new Map<string, SampleTomography>();

    @observable _referenceTomography: SampleTomography = null;

    @computed
    public get ReferenceTomography(): SampleTomography | null {
        return this._referenceTomography;
    }

    @action
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
