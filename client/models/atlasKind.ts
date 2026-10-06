export enum AtlasKindId {
    Mouse = 100
}

export enum AtlasKFamilyId {
    Mouse = 100
}

export type AtlasKindShape = {
    id: string;
    name: string;
    description: string;
    kind: AtlasKindId;
    family: AtlasKFamilyId;
    createdAt?: number;
    updatedAt?: number;
}
