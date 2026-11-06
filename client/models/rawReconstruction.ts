import {NodeCounts} from "./annotation";

// uploadedAt arrives as epoch milliseconds.
export type RawReconstruction = {
    id: string;
    notes?: string;
    uploadedAt?: Date;
    nodeCounts?: NodeCounts;
}
