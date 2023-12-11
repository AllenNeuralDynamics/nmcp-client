import {INodeBase} from "./nodeBase";
import {IStructureIdentifier} from "./structureIdentifier";

export interface ITracingNode extends INodeBase {
    id: string;
    sampleNumber: number;
    parentNumber: number;
    x: number;
    y: number;
    z: number;
    radius: number;
    structureIdValue: number;
    structureIdentifier: IStructureIdentifier;
    structureIdentifierId: string;
    brainStructureId?: string;
}
