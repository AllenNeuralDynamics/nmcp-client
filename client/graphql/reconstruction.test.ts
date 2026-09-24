import {describe, expect, it} from "vitest";

import {REQUEST_SEARCH_INDEXING_MUTATION, RETRY_PHASE_MUTATIONS} from "./reconstruction";
import {AtlasReconstructionStatus, PhaseFailureStatuses} from "../models/atlasReconstructionStatus";

describe("RETRY_PHASE_MUTATIONS", () => {
    it("has exactly the PhaseFailureStatuses as keys", () => {
        const keys = Object.keys(RETRY_PHASE_MUTATIONS).map(k => parseInt(k)).sort((a, b) => a - b);

        expect(keys).toEqual([...PhaseFailureStatuses].sort((a, b) => a - b));
    });

    it("maps FailedSearchIndexing to requestSearchIndexing", () => {
        expect(RETRY_PHASE_MUTATIONS[AtlasReconstructionStatus.FailedSearchIndexing]).toBe(REQUEST_SEARCH_INDEXING_MUTATION);
    });
});
