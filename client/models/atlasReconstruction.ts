import {User} from "./user";
import {Precomputed} from "./precomputed";
import {NodeCounts} from "./reconstruction";
import {QualityControl} from "./qualityControl";
import {AtlasNode} from "./atlasNode";

export interface AtlasReconstruction {
    id: string;
    sourceUrl: string;
    status: number;
    doi?: string;
    nodeCounts: NodeCounts;
    soma: AtlasNode;
    qualityControl: QualityControl;
    reviewerId: string;
    reviewer: User;
    precomputed?: Precomputed;
    searchIndexedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
