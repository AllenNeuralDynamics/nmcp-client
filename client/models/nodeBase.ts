export interface INodeBase {
    id: string;
    sampleNumber: number;
    parentNumber: number;
    x: number;
    y: number;
    z: number;
    radius: number;
    createdAt: number;
    updatedAt: number;
}

export function formatNodeLocation(node: INodeBase) {
    if (node) {
        const x = node.x ? node.x.toFixed(4) : "n/a";
        const y = node.y ? node.y.toFixed(4) : "n/a";
        const z = node.z ? node.z.toFixed(4) : "n/a";
        return `(${x}, ${y}, ${z})`;
    } else {
        return "(n/a)";
    }
}
