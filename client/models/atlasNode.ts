import {NodeStructureShape} from "./structureIdentifier";

export type AtlasNode = {
    id: string;
    index: number;
    parentIndex: number;
    x: number;
    y: number;
    z: number;
    radius: number;
    nodeStructure: NodeStructureShape;
    nodeStructureId: string;
    atlasStructureId?: string;
}
