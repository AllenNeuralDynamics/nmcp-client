// These must match swcValue as defined by the API.
export enum NodeStructureKind {
    any = -1,
    undefined = 0,
    soma = 1,
    axon = 2,
    basalDendrite = 3,
    apicalDendrite = 4,
    forkPoint = 5,
    endPoint = 6
}

export type NodeStructureShape = {
    id: string;
    name: string;
    swcValue: number;
}

export function displayStructureIdentifier(structure: NodeStructureShape): string {
    return structure ? structure.name : "(none)";
}
