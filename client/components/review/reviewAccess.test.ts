import {describe, expect, it} from "vitest";

import {allowedReviewStatuses, availableReviewEntries, ReviewStatusEntries, reviewStatusFilters} from "./reviewAccess";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {AbandonableFailureStatuses, AutomaticPhaseInProgressStatuses} from "../../models/atlasReconstructionStatus";

const S = ReconstructionStatus;

// The lists ReviewReconstructions.tsx held before this table replaced them; this is the only record of them.
const fullAllowedStatus = [S.PublishReview, S.Approved, S.WaitingForAtlasReconstruction, S.ReadyToPublish];
const peerAllowedStatus = [S.PeerReview];
const approvalOnlyFull = [S.PublishReview, S.Approved, S.ReadyToPublish];

const both = {peer: true, publish: true};
const publishOnly = {peer: false, publish: true};
const peerOnly = {peer: true, publish: false};

const values = (entries: { value: string }[]) => entries.map(e => e.value);

const sorted = (statuses: ReconstructionStatus[]) => [...statuses].sort((a, b) => a - b);

describe("availableReviewEntries", () => {
    it("publish-only access gets the seven publish entries", () => {
        const available = availableReviewEntries(publishOnly, false);

        expect(available).toHaveLength(7);
        expect(values(available)).not.toContain("peer-review");
    });

    it("peer-only access gets only PeerReview", () => {
        expect(values(availableReviewEntries(peerOnly, false))).toEqual(["peer-review"]);
    });

    it("both flags, the admin case, get all eight", () => {
        expect(availableReviewEntries(both, false)).toHaveLength(8);
    });

    it("both flags with Approval Only get the four approval stages", () => {
        expect(values(availableReviewEntries(both, true))).toEqual(["peer-review", "publish-review", "approved", "ready-to-publish"]);
    });
});

describe("the table reproduces the lists it replaced", () => {
    const parents = (entries: typeof ReviewStatusEntries) => sorted(allowedReviewStatuses(entries));

    it("peer entries", () => {
        expect(parents(ReviewStatusEntries.filter(e => e.access == "peer"))).toEqual(sorted(peerAllowedStatus));
    });

    it("approval-marked publish entries", () => {
        expect(parents(ReviewStatusEntries.filter(e => e.access == "publish" && e.approval))).toEqual(sorted(approvalOnlyFull));
    });

    it("all publish entries add Publishing and PublishFailed, and never Published", () => {
        const publish = parents(ReviewStatusEntries.filter(e => e.access == "publish"));

        expect(publish).toEqual(sorted([...fullAllowedStatus, S.Publishing, S.PublishFailed]));
        expect(publish).not.toContain(S.Published);
    });
});

describe("reviewStatusFilters", () => {
    it("with no selection returns each allowed status once, un-narrowed", () => {
        const filters = reviewStatusFilters(availableReviewEntries(publishOnly, false), null);

        expect(sorted(filters.map(f => f.status))).toEqual(sorted([...fullAllowedStatus, S.Publishing, S.PublishFailed]));
        expect(filters.every(f => f.atlasStatus === undefined)).toBe(true);
    });

    it("lets a dual-role reviewer combine peer and publish stages", () => {
        expect(reviewStatusFilters(availableReviewEntries(both, false), ["peer-review", "publish-review"]))
            .toEqual([{status: S.PeerReview}, {status: S.PublishReview}]);
    });

    it("keeps an un-narrowed status beside a narrowed one", () => {
        expect(reviewStatusFilters(availableReviewEntries(publishOnly, false), ["publishing", "automatic-failed"])).toEqual([
            {status: S.WaitingForAtlasReconstruction, atlasStatus: AbandonableFailureStatuses},
            {status: S.Publishing}
        ]);
    });

    it("drops a selection hidden by Approval Only and falls back to the approval statuses", () => {
        const filters = reviewStatusFilters(availableReviewEntries(publishOnly, true), ["automatic-failed"]);

        expect(filters.some(f => f.status == S.WaitingForAtlasReconstruction)).toBe(false);
        expect(filters).toEqual(approvalOnlyFull.map(status => ({status})));
    });

    it("keeps only the still-offered part of a partly hidden selection", () => {
        expect(reviewStatusFilters(availableReviewEntries(publishOnly, true), ["automatic-failed", "publish-review"]))
            .toEqual([{status: S.PublishReview}]);
    });

    it("peer-only reviewers fall back to PeerReview", () => {
        expect(reviewStatusFilters(availableReviewEntries(peerOnly, false), null)).toEqual([{status: S.PeerReview}]);
    });
});

describe("the two automatic buckets", () => {
    it("never overlap", () => {
        expect(AutomaticPhaseInProgressStatuses.filter(s => AbandonableFailureStatuses.includes(s))).toEqual([]);
    });
});
