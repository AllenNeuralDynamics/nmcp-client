import {comparer, makeAutoObservable, reaction, toJS} from "mobx";
import {debounce} from "lodash-es";

import {AtlasStructureShape} from "../models/atlasStructure";
import {SomaFilterProperties} from "../models/neuron";
import {ReconstructionStatus} from "../models/reconstructionStatus";
import {CandidateQueryVariables} from "../graphql/candidates";

export class OptionalFilter<T> {
    public isEnabled: boolean = false;
    public contents?: T = null;

    public constructor(initialContents: T = null, isEnabled: boolean = false) {
        this.contents = initialContents;
        this.isEnabled = isEnabled;

        makeAutoObservable(this);
    }
}

// Mirrors CandidateExcludedStatuses in ../nmcp-api/src/models/reconstruction.ts, the API's default for
// excludedReconstructionStatuses; it must hold the same members.
export const CandidateExcludedStatuses: ReconstructionStatus[] = [
    ReconstructionStatus.Duplicate,
    ReconstructionStatus.Incomplete,
    ReconstructionStatus.Untraceable
];

export const CandidateIncludeOptions: ReconstructionStatus[] = [ReconstructionStatus.InProgress, ...CandidateExcludedStatuses];

export class CandidateFilter {
    public atlasId: string = null;

    public includedStatuses: ReconstructionStatus[] = [];

    public samplesFilter: OptionalFilter<string[]> = new OptionalFilter([]);
    public atlasStructureFilter: OptionalFilter<AtlasStructureShape[]> = new OptionalFilter([]);
    public tagFilter: OptionalFilter<string> = new OptionalFilter("");
    public genotypeFilter: OptionalFilter<string[]> = new OptionalFilter([]);
    public limitBrightness: boolean = false;
    public brightnessRange: [number, number] = [0, 5000];
    public limitVolume: boolean = false;
    public volumeRange: [number, number] = [0, 100000];

    public constructor(atlasId: string = null) {
        this.atlasId = atlasId;

        makeAutoObservable(this);
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
        return this.includedStatuses.includes(ReconstructionStatus.InProgress);
    }

    // Undefined rather than the full list when none is included, so the request omits the argument and the API's
    // default applies.
    public get excludedReconstructionStatuses(): ReconstructionStatus[] {
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
            excludedReconstructionStatuses: this.excludedReconstructionStatuses
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
