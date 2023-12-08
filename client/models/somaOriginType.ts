export enum SomaOriginType {
    Automatic,
    Manual,
    Any
}

export interface ISomaOriginType {
    display: string;
    operator: string;
}

export function displaySomaOriginType(somaOriginType: ISomaOriginType): string {
    return somaOriginType ? somaOriginType.display : "(none)";
}
