import {User} from "./user";
import {Precomputed} from "./precomputed";
import {NodeCounts} from "./annotation";
import {QualityControl} from "./qualityControl";
import {AtlasNode} from "./atlasNode";

export interface AtlasReconstruction {
    id: string;
    sourceUrl: string;
    status: number;
    nodeCounts: NodeCounts;
    soma: AtlasNode;
    qualityControl: QualityControl;
    reviewerId: string;
    reviewer: User;
    precomputed?: Precomputed;
    searchIndexedAt: Date;
    failureReason?: string;
    failedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
