import {PublishAllLimit} from "../../../graphql/reconstruction";

export type PublishAllMode = "shown" | "all";

export type PublishAllOutcome = {
    severity: "success" | "info" | "error";
    title: string;
    message: string;
};

// "shown" sends the page's ids and the server stops at the first refusal, so a short result is a real partial failure.
// "all" asks the server for one batch of at most PublishAllLimit, oldest first, skipping blocked neurons, so any count
// is normal.  There is deliberately no totalCount parameter: comparing an "all" result with it would call every large
// or partly blocked queue a failure.
export function publishAllOutcome(mode: PublishAllMode, requested: number, published: number): PublishAllOutcome {
    if (mode == "all") {
        if (published == 0) {
            return {
                severity: "info",
                title: "Nothing Published",
                message: "No reconstructions were queued.  None were eligible, or the first one was refused."
            };
        }

        return {
            severity: "success",
            title: "Publish Submitted",
            message: `${published} reconstructions queued for search indexing.  Each run queues at most ${PublishAllLimit}, oldest first.`
        };
    }

    if (published == 0) {
        return {severity: "error", title: "Nothing Published", message: `None of the ${requested} reconstructions were queued for search indexing.`};
    }

    if (published < requested) {
        return {
            severity: "error",
            title: "Publish Partially Submitted",
            message: `${published} of ${requested} reconstructions were queued for search indexing.  Publishing stopped at the first one refused; the rest were not submitted.`
        };
    }

    return {severity: "success", title: "Publish Submitted", message: `${published} reconstructions queued for search indexing.`};
}
