export const SagittalLabel = "Sagittal";
export const HorizontalLabel = "Horizontal";
export const CoronalLabel = "Coronal";

export const SagittalLimit = 11400;
export const HorizontalLimit = 8000;
export const CoronalLimit = 13200;

export class TomographyPlaneConstants {
    public Name: string;
    public Min: number;
    public Max: number;
    public Center:number;

    public constructor(name: string, max: number) {
        this.Name = name;
        this.Min = 0;
        this.Max = max;
        this.Center = max/2;
    }
}

export class TomographyConstants {
    private static _instance: TomographyConstants = null;

    public static get Instance(): TomographyConstants {
        if (TomographyConstants._instance === null) {
            TomographyConstants._instance = new TomographyConstants();

            TomographyConstants._instance._sagittal = new TomographyPlaneConstants(SagittalLabel, SagittalLimit);
            TomographyConstants._instance._horizontal = new TomographyPlaneConstants(HorizontalLabel, HorizontalLimit);
            TomographyConstants._instance._coronal = new TomographyPlaneConstants(CoronalLabel, CoronalLimit);
        }

        return TomographyConstants._instance;
    }

    private _sagittal: TomographyPlaneConstants;
    public get Sagittal(): TomographyPlaneConstants {
        return this._sagittal;
    }

    private _horizontal: TomographyPlaneConstants;
    public get Horizontal(): TomographyPlaneConstants {
        return this._horizontal;
    }

    private _coronal: TomographyPlaneConstants;
    public get Coronal(): TomographyPlaneConstants {
        return this._coronal;
    }

    private constructor() {
    }
}