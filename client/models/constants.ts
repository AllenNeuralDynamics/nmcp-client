import {makeObservable, observable} from "mobx";

import {ConstantsQueryResponse} from "../graphql/constants";
import {AtlasStructureShape} from "./atlasStructure";
import {Atlas, AtlasShape} from "./atlas";
import {AtlasKindId, AtlasKindShape} from "./atlasKind";
import {NodeStructureShape, NodeStructureKind} from "./structureIdentifier";
import {NeuronalStructure} from "./neuronalStructure";
import {NeuronStructureShape, AxonStructureName, NeuronStructureKey, DendriteStructureName, SomaStructureName} from "./neuronStructure";
import {IQueryOperator} from "./queryOperator";

export class DataConstants {
    private _atlasKinds: AtlasKindShape[] = [];
    private _atlasKindMap = new Map<string, AtlasKindShape>();
    private _atlases: Atlas[] = [];
    private _atlasMap = new Map<string, Atlas>();
    private _atlasStructureMap = new Map<string, AtlasStructureShape>();

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

        this.loadAtlases(data.atlasKinds, data.atlases);

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

    public get Atlases(): Atlas[] {
        return this._atlases;
    }

    public get AtlasKinds(): AtlasKindShape[] {
        return this._atlasKinds;
    }

    // Deliberately no fallback to another kind: legacy numeric structure ids are read against this atlas, and in a
    // non-Mouse atlas the same numbers name different structures.
    public get DefaultAtlas(): Atlas | undefined {
        return this._atlases.find(a => a.atlasKind?.kind === AtlasKindId.Mouse);
    }

    public get DefaultAtlasKind(): AtlasKindShape | undefined {
        return this._atlasKinds.find(k => k.kind === AtlasKindId.Mouse);
    }

    public getAtlas(id: string): Atlas | undefined {
        return this._atlasMap.get(id);
    }

    public getAtlasKind(id: string): AtlasKindShape | undefined {
        return this._atlasKindMap.get(id);
    }

    public findAtlasStructure(id: string): AtlasStructureShape | undefined {
        if (!id) {
            return undefined;
        }

        return this._atlasStructureMap.get(id);
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

    private loadAtlases(atlasKinds: AtlasKindShape[], atlases: AtlasShape[]) {
        this._atlasKinds = atlasKinds ?? [];

        this._atlasKinds.forEach(k => this._atlasKindMap.set(k.id, k));

        (atlases ?? []).forEach(shape => {
            const atlas = new Atlas();

            atlas.load(shape, shape.atlasStructures ?? [], this._atlasKindMap.get(shape.atlasKindId) ?? null);

            this._atlases.push(atlas);
            this._atlasMap.set(atlas.id, atlas);

            atlas.Structures.forEach(s => this._atlasStructureMap.set(s.id, s));
        });
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
