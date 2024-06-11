export interface IMouseStrain {
    id: string;
    name: string;
}

export function displayMouseStrain(strain: IMouseStrain) {
    if (!strain || !strain || strain.name.length === 0) {
        return "(none)";
    }

    return strain.name;
}
