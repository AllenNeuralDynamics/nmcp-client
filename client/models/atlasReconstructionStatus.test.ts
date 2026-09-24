import {describe, expect, it} from "vitest";

import {
    AbandonableFailureStatuses,
    AtlasReconstructionStatus,
    atlasStatusName,
    AutomaticPhaseInProgressStatuses,
    PhaseFailureStatuses,
    statusColor
} from "./atlasReconstructionStatus";

const members = Object.values(AtlasReconstructionStatus).filter((v): v is AtlasReconstructionStatus => typeof v === "number");

describe("status subsets", () => {
    it("AbandonableFailureStatuses is PhaseFailureStatuses less FailedSearchIndexing", () => {
        expect(AbandonableFailureStatuses.every(s => PhaseFailureStatuses.includes(s))).toBe(true);
        expect(PhaseFailureStatuses.filter(s => !AbandonableFailureStatuses.includes(s))).toEqual([AtlasReconstructionStatus.FailedSearchIndexing]);
    });

    it("AutomaticPhaseInProgressStatuses holds no failed, registration or search-indexing value", () => {
        const excluded = [
            ...PhaseFailureStatuses,
            AtlasReconstructionStatus.FailedRegistration,
            AtlasReconstructionStatus.PendingRegistration,
            AtlasReconstructionStatus.InRegistration,
            AtlasReconstructionStatus.PendingSearchIndexing,
            AtlasReconstructionStatus.InSearchIndexing
        ];

        expect(AutomaticPhaseInProgressStatuses.filter(s => excluded.includes(s))).toEqual([]);
    });
});

describe("mappers", () => {
    it.each(members)("names and colours %s", status => {
        expect(atlasStatusName(status)).not.toBe("Unknown");
        expect(statusColor(status)).not.toBeNull();
        expect(statusColor(status)).not.toBe("Initialized");
    });
});
