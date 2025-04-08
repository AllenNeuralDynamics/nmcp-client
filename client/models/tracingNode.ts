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

export function nodesAsAnnotation(nodes: ITracingNode[]) {
    return nodes.map(n => {
        return {
            type: "point",
            id: n.id,
            point: [
                n.z / 10,
                n.y / 10,
                n.x / 10
            ],
            props: ["#00ff00ff", 3]
        }
    });
}
