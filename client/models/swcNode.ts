import {INodeBase} from "./nodeBase";
import {IStructureIdentifier} from "./structureIdentifier";

export interface ISwcNode extends INodeBase {
    structureIdentifier: IStructureIdentifier;
}