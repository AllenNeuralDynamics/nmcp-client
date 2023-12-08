export interface IBrainArea {
    id: string;
    name: string;
    depth: number;
    acronym: string;
    aliasList: string[];
    structureId: number;
    structureIdPath: string;
    parentStructureId: number;
    geometryFile: string;
    geometryColor: string;
    geometryEnable: boolean;
}

export function displayBrainArea(brainArea: IBrainArea, missing = "(none)") {
    if (!brainArea || !brainArea.name) {
        return missing;
    }
    return brainArea.name;
}
