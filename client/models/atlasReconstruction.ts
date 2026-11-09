import {User} from "./user";
import {Precomputed} from "./precomputed";
import {NodeCounts} from "./annotation";
import {AtlasQualityControl} from "./atlasQualityControl";
import {AtlasNode} from "./atlasNode";

export interface AtlasReconstruction {
    id: string;
    sourceUrl: string;
    status: number;
    nodeCounts: NodeCounts;
    soma: AtlasNode;
    qualityControl: AtlasQualityControl;
    reviewerId: string;
    reviewer: User;
    precomputed?: Precomputed;
    searchIndexedAt: Date;
    failureReason?: string;
    failedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
