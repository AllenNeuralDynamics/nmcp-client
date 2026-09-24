import {ReconstructionStatus, statusName} from "../../models/reconstructionStatus";
import {AbandonableFailureStatuses, AutomaticPhaseInProgressStatuses} from "../../models/atlasReconstructionStatus";
import {ReconstructionStatusFilter} from "../../graphql/reconstruction";

// The one table the Review tab's status options, their fallback and the query all derive from, so they cannot disagree
// about what a reviewer may see.  Kept apart from ReviewReconstructions.tsx, which pulls in the neuroglancer viewers,
// so that it can be tested.

export type ReviewStatusEntry = {
    value: string;
    label: string;
    filters: ReconstructionStatusFilter[];
    access: "peer" | "publish";
    approval: boolean;
};

export type ReviewAccess = {
    peer: boolean;
    publish: boolean;
};

function single(value: string, status: ReconstructionStatus, access: ReviewStatusEntry["access"], approval: boolean): ReviewStatusEntry {
    return {value, label: statusName(status), filters: [{status}], access, approval};
}

export const ReviewStatusEntries: ReviewStatusEntry[] = [
    single("peer-review", ReconstructionStatus.PeerReview, "peer", true),
    single("publish-review", ReconstructionStatus.PublishReview, "publish", true),
    single("approved", ReconstructionStatus.Approved, "publish", true),
    single("ready-to-publish", ReconstructionStatus.ReadyToPublish, "publish", true),
    {
        value: "automatic-in-progress",
        label: "In automatic processing",
        filters: [{status: ReconstructionStatus.WaitingForAtlasReconstruction, atlasStatus: AutomaticPhaseInProgressStatuses}],
        access: "publish",
        approval: false
    },
    {
        value: "automatic-failed",
        label: "Failed automatic processing",
        filters: [{status: ReconstructionStatus.WaitingForAtlasReconstruction, atlasStatus: AbandonableFailureStatuses}],
        access: "publish",
        approval: false
    },
    single("publishing", ReconstructionStatus.Publishing, "publish", false),
    single("publish-failed", ReconstructionStatus.PublishFailed, "publish", false)
];

export function availableReviewEntries(access: ReviewAccess, approvalOnly: boolean): ReviewStatusEntry[] {
    return ReviewStatusEntries.filter(e => access[e.access] && (!approvalOnly || e.approval));
}

export function allowedReviewStatuses(available: ReviewStatusEntry[]): ReconstructionStatus[] {
    return [...new Set(available.flatMap(e => e.filters.map(f => f.status)))];
}

// A selection hidden by role or by Approval Only is dropped here, so it reaches neither the control nor the query.
export function selectedReviewEntries(available: ReviewStatusEntry[], selected: string[] | null): ReviewStatusEntry[] {
    return selected ? available.filter(e => selected.includes(e.value)) : [];
}

// The API ORs statusFilters, so concatenating the selected entries' filters is their union.
export function reviewStatusFilters(available: ReviewStatusEntry[], selected: string[] | null): ReconstructionStatusFilter[] {
    const chosen = selectedReviewEntries(available, selected);

    if (chosen.length > 0) {
        return chosen.flatMap(e => e.filters);
    }

    return allowedReviewStatuses(available).map(status => ({status}));
}
