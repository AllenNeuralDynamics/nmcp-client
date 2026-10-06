import {formatAtlasStructure, AtlasStructureShape} from "./atlasStructure";
import {AtlasKindShape} from "./atlasKind";

export type AtlasShape = {
    id: string;
    name: string;
    description: string;
    reference: string;
    geometryUrl: string;
    rootStructureId: number;
    atlasKindId: string;
    atlasKind?: AtlasKindShape;
    atlasStructures?: AtlasStructureShape[];
    createdAt?: number;
    updatedAt?: number;
}

export class Atlas {
    private _shape: AtlasShape = null;
    private _atlasKind: AtlasKindShape = null;
    private _structures: AtlasStructureShape[] = [];
    private _structuresWithGeometry: AtlasStructureShape[] = [];
    private _idLookup = new Map<string, AtlasStructureShape>();
    private _structureIdLookup = new Map<number, AtlasStructureShape>();
    private _colorLookup: Record<string, string> = {};

    public get id(): string {
        return this._shape?.id ?? null;
    }

    public get name(): string {
        return this._shape?.name ?? null;
    }

    public get description(): string {
        return this._shape?.description ?? null;
    }

    public get reference(): string {
        return this._shape?.reference ?? null;
    }

    public get geometryUrl(): string {
        return this._shape?.geometryUrl ?? null;
    }

    public get rootStructureId(): number {
        return this._shape?.rootStructureId ?? null;
    }

    public get atlasKindId(): string {
        return this._shape?.atlasKindId ?? null;
    }

    public get atlasKind(): AtlasKindShape {
        return this._atlasKind;
    }

    public get Structures(): AtlasStructureShape[] {
        return this._structures;
    }

    public get StructuresWithGeometry(): AtlasStructureShape[] {
        return this._structuresWithGeometry;
    }

    public get StructureColors(): Record<string, string> {
        return this._colorLookup;
    }

    public load(shape: AtlasShape, structures: AtlasStructureShape[], atlasKind: AtlasKindShape) {
        this._shape = shape;
        this._atlasKind = atlasKind;

        // Apollo deep-freezes query results in development, so sort a copy.
        this._structures = Array.from(structures).sort((s1, s2) => formatAtlasStructure(s1).localeCompare(formatAtlasStructure(s2)));

        this._structures.map(b => {
            this._idLookup.set(b.id, b);
            this._structureIdLookup.set(b.structureId, b);
        });

        this._structuresWithGeometry = this._structures.filter(b => b.hasGeometry).sort((a: AtlasStructureShape, b: AtlasStructureShape) => {
            if (a.depth === b.depth) {
                return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
            }
            return a.depth - b.depth;
        });

        this._structures.forEach(b => {
            if (b.hasGeometry) {
                this._colorLookup[b.structureId.toString()] = "#" + b.defaultColor;
            }
        });
    }

    public findStructure(id: string | number): AtlasStructureShape | undefined {
        if (typeof id === "string")
            return this._idLookup.get(id);
        else
            return this._structureIdLookup.get(id);
    }

    public findStructureWithId(id: string): AtlasStructureShape | undefined {
        return this._idLookup.get(id);
    }

    public findStructures(id: string[]): AtlasStructureShape[] {
        return id.map(s => this._idLookup.get(s));
    }

    public findStructureWithGeometry(structure: AtlasStructureShape): AtlasStructureShape | undefined {
        let current = structure;

        while (current && !current.hasGeometry) {
            current = this._structureIdLookup.get(current.parentStructureId);
        }

        return current ?? undefined;
    }

    public structureMatchesText(value: string, option: string | AtlasStructureShape) {
        if (!value || !option) {
            return true;
        }

        let structure: AtlasStructureShape;

        if (typeof option === "string") {
            structure = this.findStructure(option);
        } else {
            structure = option;
        }

        const filterValue = value.toLowerCase();

        if (structure.name.toLowerCase().includes(filterValue)) {
            return true;
        }

        if (structure.acronym.toLowerCase().includes(filterValue)) {
            return true;
        }

        if (structure.aliases?.some(a => a.toLowerCase().includes(filterValue))) {
            return true;
        }

        const parts = filterValue.split(/\s+/);

        if (parts.length < 2) {
            return false;
        }

        const itemParts = structure.name.split(/\s+/);

        return parts.some(p => {
            return itemParts.some(i => i === p);
        });
    }
}
