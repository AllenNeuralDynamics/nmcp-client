export type AtlasStructureShape = {
    id: string;
    name: string;
    depth: number;
    acronym: string;
    aliasList: string[];
    structureId: number;
    structureIdPath: string;
    parentStructureId: number;
    defaultColor: string;
    hasGeometry: boolean;
}

export function formatAtlasStructure(structure: AtlasStructureShape, placeholder = "(none)") {
    return structure?.name ?? placeholder;
}
