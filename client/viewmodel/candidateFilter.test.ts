import {describe, expect, it} from "vitest";

import {CandidateExcludedStatuses, CandidateFilter} from "./candidateFilter";
import {ReconstructionStatus} from "../models/reconstructionStatus";
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
    const S = ReconstructionStatus;

    const rows: [string, ReconstructionStatus[], boolean, ReconstructionStatus[]][] = [
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
        expect(filter.excludedReconstructionStatuses).toEqual(excluded);
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
