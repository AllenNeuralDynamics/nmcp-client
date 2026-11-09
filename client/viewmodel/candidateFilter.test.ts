import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {
    BrightnessBounds,
    CandidateExcludedStatuses,
    CandidateFilter,
    CandidateFilterSettings,
    DefaultCandidateFilterSettings,
    OptionalFilter,
    retainKnownIds,
    sanitizeCandidateFilterSettings,
    sanitizeRangeFilter,
    watchQueryVariables
} from "./candidateFilter";
import {AnnotationStatus} from "../models/annotationStatus";
import {makeConstants} from "../test/fixtures";

const isocortex = makeConstants().findAtlasStructure("atlas-ccf-315");

describe("CandidateFilter selected atlas", () => {
    it("starts with the atlas it is given", () => {
        expect(new CandidateFilter("atlas-ccf").atlasId).toBe("atlas-ccf");
    });

    it("clears the structure filter only when the atlas changes", () => {
        const filter = new CandidateFilter("atlas-ccf");
        filter.atlasStructureFilter.contents = [isocortex];

        filter.selectAtlas("atlas-ccf");
        expect(filter.atlasStructureFilter.contents).toEqual([isocortex]);

        filter.selectAtlas("atlas-marmoset");
        expect(filter.atlasId).toBe("atlas-marmoset");
        expect(filter.atlasStructureFilter.contents).toEqual([]);
    });
});

describe("CandidateFilter include selection", () => {
    const S = AnnotationStatus;

    const rows: [string, AnnotationStatus[], boolean, AnnotationStatus[]][] = [
        ["nothing", [], false, undefined],
        ["In Progress", [S.InProgress], true, undefined],
        ["Duplicate", [S.Duplicate], false, [S.Incomplete, S.Untraceable]],
        ["Incomplete and Untraceable", [S.Incomplete, S.Untraceable], false, [S.Duplicate]],
        ["Untraceable then Duplicate", [S.Untraceable, S.Duplicate], false, [S.Incomplete]],
        ["all three excluded by default", [S.Duplicate, S.Incomplete, S.Untraceable], false, []],
        ["all four", [S.InProgress, S.Duplicate, S.Incomplete, S.Untraceable], true, []],
        ["In Progress and Incomplete", [S.InProgress, S.Incomplete], true, [S.Duplicate, S.Untraceable]]
    ];

    it.each(rows)("%s → includeInProgress and excluded statuses", (_, selected, includeInProgress, excluded) => {
        const filter = new CandidateFilter();
        filter.includedStatuses = selected;

        expect(filter.includeInProgress).toBe(includeInProgress);
        expect(filter.excludedAnnotationStatuses).toEqual(excluded);
    });

    it("counts any selection as filtering, not only In Progress", () => {
        const filter = new CandidateFilter();
        expect(filter.anyEnabled).toBe(false);

        filter.includedStatuses = [S.Duplicate];
        expect(filter.anyEnabled).toBe(true);
    });

    it("mirrors the API's default excluded statuses", () => {
        expect([...CandidateExcludedStatuses].sort()).toEqual([S.Duplicate, S.Incomplete, S.Untraceable].sort());
    });
});

describe("CandidateFilter query variables", () => {
    it("sends empty lists for disabled filters and omits the default exclusions", () => {
        const filter = new CandidateFilter("atlas-ccf");

        expect(filter.queryVariables).toEqual({
            input: {specimenIds: [], atlasStructureIds: [], keywords: [], genotype: [], somaProperties: filter.somaFilter},
            includeInProgress: false,
            excludedAnnotationStatuses: undefined
        });
    });

    it("carries each enabled filter", () => {
        const filter = new CandidateFilter("atlas-ccf");

        filter.samplesFilter.isEnabled = true;
        filter.samplesFilter.contents = ["s1"];
        filter.atlasStructureFilter.isEnabled = true;
        filter.atlasStructureFilter.contents = [isocortex];
        filter.tagFilter.isEnabled = true;
        filter.tagFilter.contents = "tag";
        filter.genotypeFilter.isEnabled = true;
        filter.genotypeFilter.contents = ["Gt"];
        filter.includedStatuses = [AnnotationStatus.InProgress, AnnotationStatus.Duplicate];
        filter.limitVolume = true;

        const variables = filter.queryVariables;

        expect(variables.input.specimenIds).toEqual(["s1"]);
        expect(variables.input.atlasStructureIds).toEqual([isocortex.id]);
        expect(variables.input.keywords).toEqual(["tag"]);
        expect(variables.input.genotype).toEqual(["Gt"]);
        expect(variables.input.somaProperties).toEqual({limitBrightness: false, brightnessRange: [0, 5000], limitVolume: true, volumeRange: [0, 100000]});
        expect(variables.includeInProgress).toBe(true);
        expect(variables.excludedAnnotationStatuses).toEqual([AnnotationStatus.Incomplete, AnnotationStatus.Untraceable]);
    });
});

describe("watchQueryVariables", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function watched() {
        const filter = new CandidateFilter("atlas-ccf");
        const apply = vi.fn();
        const watch = watchQueryVariables(filter, apply);

        return {filter, apply, watch};
    }

    it("applies a burst of changes once, after it settles", () => {
        const {filter, apply, watch} = watched();

        for (let step = 1; step <= 10; step++) {
            filter.volumeRange = [0, 1000 * step];
            vi.advanceTimersByTime(100);
        }

        expect(apply).not.toHaveBeenCalled();

        vi.advanceTimersByTime(300);

        expect(apply).toHaveBeenCalledTimes(1);
        expect(apply).toHaveBeenCalledWith(filter.queryVariables, true);

        watch.dispose();
    });

    it("ignores a change reverted inside the window, and an empty filter toggled on", () => {
        const {filter, apply, watch} = watched();

        filter.volumeRange = [0, 500];
        vi.advanceTimersByTime(100);
        filter.volumeRange = [0, 100000];
        vi.advanceTimersByTime(400);

        filter.samplesFilter.isEnabled = true;
        vi.advanceTimersByTime(400);

        expect(apply).not.toHaveBeenCalled();

        watch.dispose();
    });

    it("cancels a pending change and stops watching on dispose", () => {
        const {filter, apply, watch} = watched();

        filter.volumeRange = [0, 500];
        watch.dispose();

        vi.advanceTimersByTime(400);
        filter.volumeRange = [0, 600];
        vi.advanceTimersByTime(400);

        expect(apply).not.toHaveBeenCalled();
    });

    it("refreshes immediately with an unchanged filter", () => {
        const {filter, apply, watch} = watched();

        watch.refresh();

        expect(apply).toHaveBeenCalledTimes(1);
        expect(apply).toHaveBeenCalledWith(filter.queryVariables, false);

        watch.dispose();
    });

    it("applies a settling change once when refreshed inside the window", () => {
        const {filter, apply, watch} = watched();

        filter.volumeRange = [0, 500];
        vi.advanceTimersByTime(100);

        watch.refresh();

        expect(apply).toHaveBeenCalledTimes(1);
        expect(apply).toHaveBeenCalledWith(filter.queryVariables, true);

        vi.advanceTimersByTime(400);

        expect(apply).toHaveBeenCalledTimes(1);

        watch.dispose();
    });
});

describe("CandidateFilter settings", () => {
    const constants = makeConstants();
    const find = (id: string) => constants.findAtlasStructure(id);

    const stored: CandidateFilterSettings = {
        includedStatuses: [AnnotationStatus.Duplicate],
        specimens: {enabled: true, contents: ["s1"]},
        atlasStructures: {enabled: true, contents: ["atlas-ccf-315"]},
        keywords: {enabled: true, contents: "tag"},
        genotypes: {enabled: false, contents: ["Gt"]},
        brightness: {enabled: true, min: 10, max: 20},
        volume: {enabled: false, min: 0, max: 500}
    };

    it("starts from the default settings", () => {
        expect(new CandidateFilter("atlas-ccf").settings).toEqual(DefaultCandidateFilterSettings);
    });

    it("round-trips applied settings, with structures as ids and ranges as objects", () => {
        const filter = new CandidateFilter("atlas-ccf");

        filter.applySettings(stored, find);

        expect(filter.settings).toEqual(stored);
        expect(filter.atlasStructureFilter.contents).toEqual([isocortex]);
        expect(filter.queryVariables.input.specimenIds).toEqual(["s1"]);
        expect(filter.somaFilter).toMatchObject({limitBrightness: true, brightnessRange: [10, 20]});
    });

    it("drops structure ids the constants don't know", () => {
        const filter = new CandidateFilter("atlas-ccf");

        filter.applySettings({...stored, atlasStructures: {enabled: true, contents: ["atlas-ccf-315", "missing"]}}, find);

        expect(filter.settings.atlasStructures.contents).toEqual(["atlas-ccf-315"]);
    });

    it("returns to an unfiltered state when the defaults are applied", () => {
        const filter = new CandidateFilter("atlas-ccf");

        filter.applySettings(stored, find);
        expect(filter.anyEnabled).toBe(true);

        filter.applySettings(DefaultCandidateFilterSettings, find);
        expect(filter.anyEnabled).toBe(false);
        expect(filter.settings).toEqual(DefaultCandidateFilterSettings);
    });

    it("sanitizes statuses and ranges", () => {
        const sanitized = sanitizeCandidateFilterSettings({
            ...stored,
            includedStatuses: [AnnotationStatus.InProgress, AnnotationStatus.Published],
            brightness: {enabled: true, min: 30, max: 20},
            volume: {enabled: true, min: 0, max: 200000}
        });

        expect(sanitized.includedStatuses).toEqual([AnnotationStatus.InProgress]);
        expect(sanitized.brightness).toEqual({enabled: true, min: 0, max: 5000});
        expect(sanitized.volume).toEqual({enabled: true, min: 0, max: 100000});
        expect(sanitizeRangeFilter(stored.brightness, BrightnessBounds)).toBe(stored.brightness);
    });
});

describe("OptionalFilter settings", () => {
    it("builds from, reports and applies settings", () => {
        const filter = OptionalFilter.fromSettings({enabled: true, contents: ["a"]});

        expect(filter.settings).toEqual({enabled: true, contents: ["a"]});

        filter.apply({enabled: false, contents: ["b"]});

        expect(filter.isEnabled).toBe(false);
        expect(filter.contents).toEqual(["b"]);
    });

    it("retains only known ids, leaving the list alone when all are known", () => {
        const filter = OptionalFilter.fromSettings({enabled: true, contents: ["a", "b"]});

        const before = filter.contents;

        retainKnownIds(filter, new Set(["a", "b", "c"]));
        expect(filter.contents).toBe(before);

        retainKnownIds(filter, new Set(["b"]));
        expect(filter.contents).toEqual(["b"]);
    });
});
