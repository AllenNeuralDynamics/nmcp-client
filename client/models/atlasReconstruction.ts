import {User} from "./user";
import {Precomputed} from "./precomputed";
import {NodeCounts} from "./reconstruction";
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
    qualityCheck: any;
    qualityCheckStatus: number;
    qualityCheckAt: Date;
    searchIndexedAt: Date;
}
