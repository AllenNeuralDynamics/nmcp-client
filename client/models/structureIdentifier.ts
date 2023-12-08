export enum StructureIdentifier {
    any = -1,
    undefined = 0,
    soma = 1,
    axon = 2,
    basalDendrite = 3,
    apicalDendrite = 4,
    forkPoint = 5,
    endPoint = 6
}

export const AnyStructureIdentifier: IStructureIdentifier = {
    id: "",
    name: "any",
    value: -1
};

export interface IStructureIdentifier {
    id: string;
    name: string;
    value: number;
}

export function displayStructureIdentifier(structureIdentifier: IStructureIdentifier): string {
    return structureIdentifier ? structureIdentifier.name : "(none)";
}
