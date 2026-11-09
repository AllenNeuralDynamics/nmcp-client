import {comparer, makeAutoObservable, reaction, runInAction, toJS} from "mobx";
import {debounce} from "lodash-es";

import {AtlasStructureShape} from "../models/atlasStructure";
import {SomaFilterProperties} from "../models/neuron";
import {AnnotationStatus} from "../models/annotationStatus";
import {CandidateQueryVariables} from "../graphql/candidates";
import {numberList, stringList} from "../util/pageSettings";

export type OptionalFilterSettings<T> = {
    enabled: boolean;
    contents: T;
}

export type RangeFilterSettings = {
    enabled: boolean;
    min: number;
    max: number;
}

export class OptionalFilter<T> {
    public isEnabled: boolean = false;
    public contents?: T = null;

    public constructor(initialContents: T = null, isEnabled: boolean = false) {
        this.contents = initialContents;
        this.isEnabled = isEnabled;

        makeAutoObservable(this);
    }

    public static fromSettings<T>(settings: OptionalFilterSettings<T>): OptionalFilter<T> {
        return new OptionalFilter(settings.contents, settings.enabled);
    }

    public get settings(): OptionalFilterSettings<T> {
        return {enabled: this.isEnabled, contents: toJS(this.contents)};
    }

    public apply(settings: OptionalFilterSettings<T>) {
        this.isEnabled = settings.enabled;
        this.contents = settings.contents;
    }
}

// Drops ids the loaded options no longer hold, leaving the filter untouched when nothing is dropped.
export function retainKnownIds(filter: OptionalFilter<string[]>, known: ReadonlySet<string>): void {
    const contents = filter.contents ?? [];

    const kept = contents.filter(id => known.has(id));

    if (kept.length !== contents.length) {
        runInAction(() => filter.contents = kept);
    }
}

export const BrightnessBounds: [number, number] = [0, 5000];

export const VolumeBounds: [number, number] = [0, 100000];

export type CandidateFilterSettings = {
    includedStatuses: AnnotationStatus[];
    specimens: OptionalFilterSettings<string[]>;
    atlasStructures: OptionalFilterSettings<string[]>;
    keywords: OptionalFilterSettings<string>;
    genotypes: OptionalFilterSettings<string[]>;
    brightness: RangeFilterSettings;
    volume: RangeFilterSettings;
}

export const DefaultCandidateFilterSettings: CandidateFilterSettings = {
    includedStatuses: numberList<AnnotationStatus>(),
    specimens: {enabled: false, contents: stringList()},
    atlasStructures: {enabled: false, contents: stringList()},
    keywords: {enabled: false, contents: ""},
    genotypes: {enabled: false, contents: stringList()},
    brightness: {enabled: false, min: BrightnessBounds[0], max: BrightnessBounds[1]},
    volume: {enabled: false, min: VolumeBounds[0], max: VolumeBounds[1]}
};

export function sanitizeRangeFilter(range: RangeFilterSettings, bounds: [number, number]): RangeFilterSettings {
    if (bounds[0] <= range.min && range.min <= range.max && range.max <= bounds[1]) {
        return range;
    }

    return {enabled: range.enabled, min: bounds[0], max: bounds[1]};
}

// Mirrors CandidateExcludedStatuses in ../nmcp-api/src/models/reconstruction.ts, the API's default for
// excludedAnnotationStatuses; it must hold the same members.
export const CandidateExcludedStatuses: AnnotationStatus[] = [
    AnnotationStatus.Duplicate,
    AnnotationStatus.Incomplete,
    AnnotationStatus.Untraceable
];

export const CandidateIncludeOptions: AnnotationStatus[] = [AnnotationStatus.InProgress, ...CandidateExcludedStatuses];

export function sanitizeCandidateFilterSettings(settings: CandidateFilterSettings): CandidateFilterSettings {
    return {
        ...settings,
        includedStatuses: settings.includedStatuses.filter(s => CandidateIncludeOptions.includes(s)),
        brightness: sanitizeRangeFilter(settings.brightness, BrightnessBounds),
        volume: sanitizeRangeFilter(settings.volume, VolumeBounds)
    };
}

export class CandidateFilter {
    public atlasId: string = null;

    public includedStatuses: AnnotationStatus[] = [];

    public samplesFilter: OptionalFilter<string[]> = new OptionalFilter([]);
    public atlasStructureFilter: OptionalFilter<AtlasStructureShape[]> = new OptionalFilter([]);
    public tagFilter: OptionalFilter<string> = new OptionalFilter("");
    public genotypeFilter: OptionalFilter<string[]> = new OptionalFilter([]);
    public limitBrightness: boolean = false;
    public brightnessRange: [number, number] = [...BrightnessBounds];
    public limitVolume: boolean = false;
    public volumeRange: [number, number] = [...VolumeBounds];

    public constructor(atlasId: string = null) {
        this.atlasId = atlasId;

        makeAutoObservable(this);
    }

    public get settings(): CandidateFilterSettings {
        return {
            includedStatuses: toJS(this.includedStatuses),
            specimens: this.samplesFilter.settings,
            atlasStructures: {enabled: this.atlasStructureFilter.isEnabled, contents: this.atlasStructureFilter.contents.map(s => s.id)},
            keywords: this.tagFilter.settings,
            genotypes: this.genotypeFilter.settings,
            brightness: {enabled: this.limitBrightness, min: this.brightnessRange[0], max: this.brightnessRange[1]},
            volume: {enabled: this.limitVolume, min: this.volumeRange[0], max: this.volumeRange[1]}
        };
    }

    // The atlas is not part of the settings: no page lets the user change it.
    public applySettings(settings: CandidateFilterSettings, findStructure: (id: string) => AtlasStructureShape | undefined) {
        this.includedStatuses = settings.includedStatuses;
        this.samplesFilter.apply(settings.specimens);
        this.atlasStructureFilter.apply({
            enabled: settings.atlasStructures.enabled,
            contents: settings.atlasStructures.contents.map(findStructure).filter(s => s != null)
        });
        this.tagFilter.apply(settings.keywords);
        this.genotypeFilter.apply(settings.genotypes);
        this.limitBrightness = settings.brightness.enabled;
        this.brightnessRange = [settings.brightness.min, settings.brightness.max];
        this.limitVolume = settings.volume.enabled;
        this.volumeRange = [settings.volume.min, settings.volume.max];
    }

    // The structure filter holds structures of the previous atlas.
    public selectAtlas(atlasId: string) {
        if (atlasId === this.atlasId) {
            return;
        }

        this.atlasId = atlasId;
        this.atlasStructureFilter.contents = [];
    }

    public get anyEnabled(): boolean {
        return this.includedStatuses.length > 0 || this.samplesFilter.isEnabled || this.atlasStructureFilter.isEnabled || this.tagFilter.isEnabled || this.genotypeFilter.isEnabled || this.limitBrightness || this.limitVolume
    }

    public get includeInProgress(): boolean {
        return this.includedStatuses.includes(AnnotationStatus.InProgress);
    }

    // Undefined rather than the full list when none is included, so the request omits the argument and the API's
    // default applies.
    public get excludedAnnotationStatuses(): AnnotationStatus[] {
        if (!CandidateExcludedStatuses.some(s => this.includedStatuses.includes(s))) {
            return undefined;
        }

        return CandidateExcludedStatuses.filter(s => !this.includedStatuses.includes(s));
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

    public get genotypes(): string[] {
        return this.genotypeFilter.isEnabled ? this.genotypeFilter.contents : [];
    }

    public get somaFilter(): SomaFilterProperties {
        const input: any = {};

        input.limitBrightness = this.limitBrightness;
        input.brightnessRange = this.brightnessRange;

        input.limitVolume = this.limitVolume;
        input.volumeRange = this.volumeRange;

        return input;
    }

    // Plain copies, not the observable arrays, so a variables object recorded as applied can't change underneath the
    // structural comparison that decides whether a later one differs.
    public get queryVariables(): CandidateQueryVariables {
        return toJS({
            input: {
                specimenIds: this.specimenIds,
                atlasStructureIds: this.atlasStructureIds,
                keywords: this.keywords,
                genotype: this.genotypes,
                somaProperties: this.somaFilter
            },
            includeInProgress: this.includeInProgress,
            excludedAnnotationStatuses: this.excludedAnnotationStatuses
        });
    }
}

export type CandidateFilterWatch = {
    refresh(): void;
    dispose(): void;
}

// A trailing debounce rather than reaction's own delay: that delay schedules one run per window and never restarts, so
// a drag longer than the window would reset both views repeatedly while still moving.
export function watchQueryVariables(filter: CandidateFilter, apply: (variables: CandidateQueryVariables, filterChanged: boolean) => void, delayMs: number = 300): CandidateFilterWatch {
    let lastApplied = filter.queryVariables;

    const settle = debounce((variables: CandidateQueryVariables) => {
        if (comparer.structural(variables, lastApplied)) {
            return;
        }

        lastApplied = variables;

        apply(variables, true);
    }, delayMs);

    const disposeReaction = reaction(() => filter.queryVariables, variables => settle(variables), {equals: comparer.structural});

    return {
        refresh() {
            settle.cancel();

            const variables = filter.queryVariables;
            const filterChanged = !comparer.structural(variables, lastApplied);

            lastApplied = variables;

            apply(variables, filterChanged);
        },
        dispose() {
            disposeReaction();
            settle.cancel();
        }
    };
}
