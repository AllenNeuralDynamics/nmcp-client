import {IStructureIdentifier} from "./structureIdentifier";

export interface ISwcNode {
    id: string;
    sampleNumber: number;
    parentNumber: number;
    x: number;
    y: number;
    z: number;
    radius: number;
    structureIdentifier: IStructureIdentifier;
    createdAt: number;
    updatedAt: number;
}

export function formatNodeCoordinates(x: number, y: number, z: number) {
    const nx = x ? x.toFixed(1) : "n/a";
    const ny = y ? y.toFixed(1) : "n/a";
    const nz = z ? z.toFixed(1) : "n/a";

    return `${nx}, ${ny}, ${nz}`;
}

export function formatNodeLocation(node: ISwcNode) {
    if (node) {
        return formatNodeCoordinates(node.x, node.y, node.z);
    } else {
        return "(n/a)";
    }
}
