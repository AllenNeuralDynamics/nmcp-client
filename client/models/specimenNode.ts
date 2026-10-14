import {NodeStructureShape} from "./structureIdentifier";

export type SpecimenNode = {
    id: string;
    index?: number;
    parentIndex?: number;
    x: number;
    y: number;
    z: number;
    radius?: number;
    nodeStructure?: NodeStructureShape;
    nodeStructureId?: string;
}
