import {describe, expect, it} from "vitest";

import {filterableAnnotationStatuses, AnnotationStatus, statusColor, statusName, statusNameOnly} from "./annotationStatus";
import {AtlasReconstructionStatus, atlasStatusName} from "./atlasReconstructionStatus";

const members = Object.values(AnnotationStatus).filter((v): v is AnnotationStatus => typeof v === "number");

describe("mappers", () => {
    it.each(members)("names and colours %s", status => {
        expect(statusNameOnly(status)).not.toBe("UNKNOWN");
        expect(statusColor(status)).not.toBe("black");
    });

    it("names the two reviews apart", () => {
        expect(statusNameOnly(AnnotationStatus.PeerReview)).toBe("In Peer Review");
        expect(statusNameOnly(AnnotationStatus.PublishReview)).toBe("In Publish Review");
    });
});

describe("holds added for the API", () => {
    it("mirrors the API's values", () => {
        expect(AnnotationStatus.Incomplete).toBe(210);
        expect(AnnotationStatus.Duplicate).toBe(220);
    });

    it("names each by its status name", () => {
        expect(statusNameOnly(AnnotationStatus.Incomplete)).toBe("Incomplete");
        expect(statusNameOnly(AnnotationStatus.Duplicate)).toBe("Duplicate");
    });

    it("colours each as Untraceable", () => {
        expect(statusColor(AnnotationStatus.Incomplete)).toBe(statusColor(AnnotationStatus.Untraceable));
        expect(statusColor(AnnotationStatus.Duplicate)).toBe(statusColor(AnnotationStatus.Untraceable));
    });
});

describe("statusName", () => {
    const child = AtlasReconstructionStatus.FailedPrecomputed;
    const composing = [AnnotationStatus.WaitingForAtlasReconstruction, AnnotationStatus.PublishFailed];

    it.each(members)("composes the child phase only where it applies: %s", status => {
        const composed = statusName(status, child).includes(atlasStatusName(child));

        expect(composed).toBe(composing.includes(status));
    });
});

describe("filterableAnnotationStatuses", () => {
    const filterable = filterableAnnotationStatuses();

    it("returns only numbers", () => {
        expect(filterable.every(s => typeof s === "number")).toBe(true);
    });

    it("excludes Multiple and Approved", () => {
        expect(filterable).not.toContain(AnnotationStatus.Multiple);
        expect(filterable).not.toContain(AnnotationStatus.Approved);
    });

    it("includes every other member", () => {
        expect(filterable).toEqual(members.filter(s => s != AnnotationStatus.Multiple && s != AnnotationStatus.Approved));
        expect(filterable).toContain(AnnotationStatus.TeamReview);
        expect(filterable).toContain(AnnotationStatus.Untraceable);
        expect(filterable).toContain(AnnotationStatus.PublishFailed);
        expect(filterable).toContain(AnnotationStatus.Incomplete);
        expect(filterable).toContain(AnnotationStatus.Duplicate);
    });
});
