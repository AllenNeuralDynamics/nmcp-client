import {NodeCounts} from "./annotation";
import {SpecimenSpaceReconstructionStatus} from "./specimenSpaceReconstructionStatus";
import {SpecimenNode} from "./specimenNode";
import {Precomputed} from "./precomputed";

export type SpecimenSpaceReconstruction = {
    id: string;
    status: SpecimenSpaceReconstructionStatus;
    sourceUrl: string;
    sourceComments?: string;
    lengthMillimeters: number;
    nodeCounts: NodeCounts;
    soma?: SpecimenNode;
    precomputed?: Precomputed;
    annotationId: string;
    createdAt: Date;
    updatedAt: Date;
}
