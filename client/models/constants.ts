import {ConstantsQueryResponse} from "../graphql/constants";
import {formatAtlasStructure, AtlasStructureShape} from "./atlasStructure";
import {NodeStructureShape, NodeStructureKind} from "./structureIdentifier";
import {NeuronalStructure} from "./neuronalStructure";
import {NeuronStructureShape, AxonStructureName, NeuronStructureKey, DendriteStructureName, SomaStructureName} from "./neuronStructure";
import {IQueryOperator} from "./queryOperator";
import {makeObservable, observable} from "mobx";

export class AtlasConstants {
    private _structures: AtlasStructureShape[] = [];
    private _structuresWithGeometry: AtlasStructureShape[] = [];
    private _idLookup = new Map<string, AtlasStructureShape>();
    private _structureIdLookup = new Map<number, AtlasStructureShape>();
    private _colorLookup: Map<string, string> = new Map();

    public get Structures(): AtlasStructureShape[] {
        return this._structures;
    }

    public get StructuresWithGeometry(): AtlasStructureShape[] {
        return this._structuresWithGeometry;
    }

    public get StructureColors(): Map<string, string> {
        return this._colorLookup;
    }

    public load(structures: AtlasStructureShape[]) {
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

        if (structure.aliasList?.some(a => a.toLowerCase().includes(filterValue))) {
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

    public matchesText(value: string) {
        return this._structures.filter(s => this.structureMatchesText(value, s));
    }
}

export class DataConstants {
    private _atlasConstants: AtlasConstants = new AtlasConstants();

    private _QueryOperators: IQueryOperator[] = [];
    private _queryOperatorMap = new Map<string, IQueryOperator>();

    private _structureIdentifierMap = new Map<string, NodeStructureShape>();

    private _NeuronStructures: NeuronalStructure[] = [];
    private _neuronStructureMap = new Map<string, NeuronalStructure>();

    private _apiVersion: string = "";

    public neuronCount = -1;

    private _isLoaded: boolean;

    public constructor() {
        this._isLoaded = false;

        makeObservable(this, {
            neuronCount: observable
        });
    }

    public load(data: ConstantsQueryResponse) {
        if (this._isLoaded) {
            return;
        }

        this._apiVersion = data.systemSettings.apiVersion;
        this.neuronCount = data.systemSettings.neuronCount;

        this._atlasConstants.load(data.atlasStructures);

        this.loadQueryOperators(data.queryOperators);
        this.loadStructureIdentifiers(data.nodeStructures)
        this.loadNeuronalStructures(data.neuronStructures, data.nodeStructures);

        this._isLoaded = true;
    }

    public get ApiVersion(): string {
        return this._apiVersion;
    }

    public get NeuronStructures(): NeuronalStructure[] {
        return this._NeuronStructures;
    }

    public get QueryOperators(): IQueryOperator[] {
        return this._QueryOperators;
    }

    public get AtlasConstants(): AtlasConstants {
        return this._atlasConstants;
    }

    public findStructureIdentifier(id: string) {
        return this._structureIdentifierMap.get(id);
    }

    public findQueryOperator(id: string) {
        return this._queryOperatorMap.get(id);
    }

    public findNeuronalStructure(id: string) {
        return this._neuronStructureMap.get(id);
    }

    private loadStructureIdentifiers(structures: NodeStructureShape[]) {
        structures.map(s => this._structureIdentifierMap.set(s.id, s));
    }

    private loadNeuronalStructures(ts: NeuronStructureShape[], si: NodeStructureShape[]) {
        // These are a fixed set of pairings supported in search predicates.
        // Ids are used to serialize search predicates locally and for sharing so must remain constant.
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("fc6ba542-1a5d-417a-b33e-8eb23b96e473", SomaStructureName, ts, NodeStructureKind.soma, si));
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("bd3a8d75-12dd-4152-8f1c-2cd0119679dd", AxonStructureName, ts, NodeStructureKind.any, si));
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("f42cee66-4ec6-420e-a22f-e54ff82f031e", AxonStructureName, ts, NodeStructureKind.forkPoint, si));
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("d4fe500f-01fe-47b8-91c4-42d1550115cd", AxonStructureName, ts, NodeStructureKind.endPoint, si));
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("8f993619-b916-4a42-aa9e-518e9715d819", DendriteStructureName, ts, NodeStructureKind.any, si));
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("bf239333-0df6-4bec-90dc-f47bdb2bdf40", DendriteStructureName, ts, NodeStructureKind.forkPoint, si));
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("adc95a87-d80e-4058-8ea1-7d11766c0188", DendriteStructureName, ts, NodeStructureKind.endPoint, si));
    }

    private makeNeuronalStructurePairing(id: string, tsValue: NeuronStructureKey, ts: NeuronStructureShape[], siValue: number, si: NodeStructureShape[]): NeuronalStructure {
        const pair = new NeuronalStructure(id, si.find(s => s.swcValue === siValue) || null, ts.find(t => t.name === tsValue) || null);

        this._neuronStructureMap.set(pair.id, pair);

        return pair;
    }

    private loadQueryOperators(queryOperators: IQueryOperator[]) {
        this._QueryOperators = queryOperators;

        this._QueryOperators.map(q => this._queryOperatorMap.set(q.id, q));
    }
}
