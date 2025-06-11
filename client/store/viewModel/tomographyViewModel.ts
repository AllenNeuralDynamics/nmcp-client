import {observable, computed, action, observe, makeObservable} from 'mobx';

import {TomographyConstants, TomographyPlaneConstants} from "../../tomography/tomographyConstants";
import {ISample} from "../../models/sample";
import {SampleTomography, Threshold, TomographyCollection} from "../system/tomographyCollection";
import {Point3D} from "../../util/viewerTypes";

const tomographyConstants = TomographyConstants.Instance;

const ThresholdPaddingPercentage = 0.2;

export class SliceControlViewModel {
    public IsEnabled: boolean = false;
    public Location: number = 0;

    public constructor(constants: TomographyPlaneConstants) {
        makeObservable(this, {IsEnabled: observable, Location: observable});
        this.IsEnabled = false;
        this.Location = constants.Center;
    }
}

export class SampleTomographyViewModel {
    private readonly _sampleTomography: SampleTomography;

    public constructor(tomography: SampleTomography) {
        this._sampleTomography = tomography;

        makeObservable(this, {
            SampleIdNumber: observable,
            UseCustomThreshold: observable,
            CustomThreshold: observable,
            CustomThresholdLimits: observable,
            SampleTomography: computed,
            IsReferenceSample: computed,
            IsCustomThreshold: computed,
            incrementMinThreshold: action,
            incrementMaxThreshold: action,
            updateCustomThreshold: action,
            resetCustomThreshold: action
        });

        this.resetCustomThreshold();

        this.computePaddedLimits();
    }

    public SampleIdNumber: number = 0;

    public UseCustomThreshold: boolean = false;

    public CustomThreshold: Threshold = new Threshold(0, 1);

    public CustomThresholdLimits: Threshold = new Threshold(0, 1);

    get SampleTomography(): SampleTomography {
        return this._sampleTomography;
    }

    get IsReferenceSample(): boolean {
        return this._sampleTomography.IsReferenceTomography;
    }

    get IsCustomThreshold(): boolean {
        return this.UseCustomThreshold && (this.CustomThreshold.Min !== this._sampleTomography.DefaultThreshold.Min || this.CustomThreshold.Max !== this._sampleTomography.DefaultThreshold.Max);
    }

    public incrementMinThreshold(amount: number) {
        this.CustomThreshold.Min = Math.max(this.CustomThresholdLimits.Min, Math.min(this.CustomThresholdLimits.Max, this.CustomThreshold.Min + amount));
    }

    public incrementMaxThreshold(amount: number) {
        this.CustomThreshold.Max = Math.max(this.CustomThresholdLimits.Min, Math.min(this.CustomThresholdLimits.Max, this.CustomThreshold.Max + amount));
    }

    public updateCustomThreshold(value: [number, number]): void {
        this.CustomThreshold.Min = value[0];
        this.CustomThreshold.Max = value[1];
    }

    public resetCustomThreshold() {
        this.CustomThreshold.Min = this._sampleTomography.DefaultThreshold.Min;
        this.CustomThreshold.Max = this._sampleTomography.DefaultThreshold.Max;
    }

    private computePaddedLimits() {
        const threshold = [this.CustomThreshold.Min, this.CustomThreshold.Max];

        const padding = Math.floor((threshold[1] - threshold[0]) * ThresholdPaddingPercentage);

        this.CustomThresholdLimits.Min = Math.max(0, threshold[0] - padding);
        this.CustomThresholdLimits.Max = Math.min(16384, threshold[1] + padding);
    }
}

/**
 * The collection of all known tomography view models and general tomography user interface status (are controls
 * collapsed or shown, etc.).
 */
export class TomographyViewModel {
    private readonly _tomographyDataStore: TomographyCollection;

    private _viewModels: Map<string, SampleTomographyViewModel> = new Map<string, SampleTomographyViewModel>();

    private _lastTomography: SampleTomographyViewModel | null = null;

    public _selection: SampleTomographyViewModel | null = null;

    public _refTomography: SampleTomographyViewModel = null;

    public constructor(tomographyDataStore: TomographyCollection) {
        makeObservable(this, {
            _selection: observable,
            _refTomography: observable,
            AreControlsVisible: observable,
            Sagittal: observable,
            Horizontal: observable,
            Coronal: observable,
            ReferenceSampleTomography: computed,
            title: computed,
            Selection: computed,
            CanSwapSample: computed,
            CurrentLocation: computed,
            setSample: action,
            swapSample: action
        });

        this._tomographyDataStore = tomographyDataStore;

        // Tomography will most likely not have been loaded when this view model is created.
        observe(tomographyDataStore, () => {
            if (this._refTomography == null && tomographyDataStore.ReferenceTomography != null) {
                this._selection = this.ReferenceSampleTomography;
            }
        });
    }

    public AreControlsVisible: boolean = true;

    public Sagittal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Sagittal);
    public Horizontal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Horizontal);
    public Coronal: SliceControlViewModel = new SliceControlViewModel(tomographyConstants.Coronal);

    get ReferenceSampleTomography(): SampleTomographyViewModel | null {

        if (this._refTomography == null && this._tomographyDataStore.ReferenceTomography != null) {
            this._refTomography = new SampleTomographyViewModel(this._tomographyDataStore.ReferenceTomography);
        }

        return this._refTomography;
    }

    public get title(): string {
        return this.Selection != null ? this.Selection.IsReferenceSample ? "Reference" : `Sample ${this.Selection.SampleIdNumber}` : "No Selection";
    }

    public get Selection(): SampleTomographyViewModel | null {
        return this._selection;
    };

    get CanSwapSample(): boolean {
        return this.Selection !== null && (this.Selection !== this._refTomography || this._lastTomography !== null);
    }

    get CurrentLocation(): Point3D {
        return [this.Sagittal.Location, this.Horizontal.Location, this.Coronal.Location]
    }

    public setSample(sample: ISample) {
        if (this._viewModels.has(sample.id)) {
            this._selection = this._viewModels.get(sample.id)!;
        } else if (this._tomographyDataStore.SampleTomographyMap.has(sample.id)) {
            this._selection = new SampleTomographyViewModel(this._tomographyDataStore.SampleTomographyMap.get(sample.id)!);
            this._viewModels.set(sample.id, this._selection);
        } else {
            this._selection = this._refTomography; // May or may not exist at this time.
        }

        if (this._selection && this._selection !== this._refTomography) {
            this._selection.SampleIdNumber = sample.idNumber;
        }
    }

    public swapSample() {
        if (this.Selection && this.Selection.IsReferenceSample) {
            this._selection = this._lastTomography;
            this._lastTomography = null;
        } else {
            this._lastTomography = this._selection;
            this._selection = this._refTomography;
        }
    }
}
