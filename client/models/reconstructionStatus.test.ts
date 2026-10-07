import {describe, expect, it} from "vitest";

import {filterableReconstructionStatuses, ReconstructionStatus, statusColor, statusName, statusNameOnly} from "./reconstructionStatus";
import {AtlasReconstructionStatus, atlasStatusName} from "./atlasReconstructionStatus";

const members = Object.values(ReconstructionStatus).filter((v): v is ReconstructionStatus => typeof v === "number");

describe("mappers", () => {
    it.each(members)("names and colours %s", status => {
        expect(statusNameOnly(status)).not.toBe("UNKNOWN");
        expect(statusColor(status)).not.toBe("black");
    });

    it("names the two reviews apart", () => {
        expect(statusNameOnly(ReconstructionStatus.PeerReview)).toBe("In Peer Review");
        expect(statusNameOnly(ReconstructionStatus.PublishReview)).toBe("In Publish Review");
    });
});

describe("holds added for the API", () => {
    it("mirrors the API's values", () => {
        expect(ReconstructionStatus.Incomplete).toBe(210);
        expect(ReconstructionStatus.Duplicate).toBe(220);
    });

    it("names each by its status name", () => {
        expect(statusNameOnly(ReconstructionStatus.Incomplete)).toBe("Incomplete");
        expect(statusNameOnly(ReconstructionStatus.Duplicate)).toBe("Duplicate");
    });

    it("colours each as Untraceable", () => {
        expect(statusColor(ReconstructionStatus.Incomplete)).toBe(statusColor(ReconstructionStatus.Untraceable));
        expect(statusColor(ReconstructionStatus.Duplicate)).toBe(statusColor(ReconstructionStatus.Untraceable));
    });
});

describe("statusName", () => {
    const child = AtlasReconstructionStatus.FailedPrecomputed;
    const composing = [ReconstructionStatus.WaitingForAtlasReconstruction, ReconstructionStatus.PublishFailed];

    it.each(members)("composes the child phase only where it applies: %s", status => {
        const composed = statusName(status, child).includes(atlasStatusName(child));

        expect(composed).toBe(composing.includes(status));
    });
});

describe("filterableReconstructionStatuses", () => {
    const filterable = filterableReconstructionStatuses();

    it("returns only numbers", () => {
        expect(filterable.every(s => typeof s === "number")).toBe(true);
    });

    it("excludes Multiple and Approved", () => {
        expect(filterable).not.toContain(ReconstructionStatus.Multiple);
        expect(filterable).not.toContain(ReconstructionStatus.Approved);
    });

    it("includes every other member", () => {
        expect(filterable).toEqual(members.filter(s => s != ReconstructionStatus.Multiple && s != ReconstructionStatus.Approved));
        expect(filterable).toContain(ReconstructionStatus.TeamReview);
        expect(filterable).toContain(ReconstructionStatus.Untraceable);
        expect(filterable).toContain(ReconstructionStatus.PublishFailed);
        expect(filterable).toContain(ReconstructionStatus.Incomplete);
        expect(filterable).toContain(ReconstructionStatus.Duplicate);
    });
});
