import {IBrainArea} from "./brainArea";
import {IStructureIdentifier, StructureIdentifier} from "./structureIdentifier";
import {NeuronalStructure} from "./neuronalStructure";
import {ConstantsQueryResponse} from "../graphql/constants";
import {ITracingStructure, TracingStructure} from "./tracingStructure";
import {IQueryOperator} from "./queryOperator";

export class NdbConstants {
    private _QueryOperators: IQueryOperator[] = [];
    private _queryOperatorMap = new Map<string, IQueryOperator>();

    private _BrainAreas: IBrainArea[] = [];
    private _brainAreasWithGeometry: IBrainArea[] = [];
    private _brainAreaIdMap = new Map<string, IBrainArea>();
    private _brainAreaStructureIdMap = new Map<number, IBrainArea>();

    private _brainStructureColorMap: Map<string, string> = new Map();

    private _structureIdentifierMap = new Map<string, IStructureIdentifier>();

    private _tracingStructures: ITracingStructure[] = [];

    private _NeuronStructures: NeuronalStructure[] = [];
    private _neuronStructureMap = new Map<string, NeuronalStructure>();

    private _apiVersion: string = "";

    private _neuronCount = -1;

    private _isLoaded: boolean;

    public constructor() {
        this._isLoaded = false;
    }

    public load(data: ConstantsQueryResponse) {
        if (this._isLoaded) {
            return;
        }

        this._apiVersion = data.systemSettings.apiVersion;
        this._neuronCount = data.systemSettings.neuronCount;

        this.loadQueryOperators(data.queryOperators);
        this.loadBrainAreas(data.brainAreas);
        this.loadStructureIdentifiers(data.structureIdentifiers)
        this.loadTracingStructures(data.tracingStructures);
        this.loadNeuronalStructures(data.tracingStructures, data.structureIdentifiers);

        this._isLoaded = true;
    }

    public get IsLoaded(): boolean {
        return this._isLoaded;
    }

    public get ApiVersion(): string {
        return this._apiVersion;
    }

    public get NeuronCount(): number {
        return this._neuronCount;
    }

    public get QueryOperators(): IQueryOperator[] {
        return this._QueryOperators;
    }

    public get BrainAreas(): IBrainArea[] {
        return this._BrainAreas;
    }

    public get BrainAreasWithGeometry(): IBrainArea[] {
        return this._brainAreasWithGeometry;
    }

    public get NeuronStructures(): NeuronalStructure[] {
        return this._NeuronStructures;
    }

    public get BrainStructureColorMap(): Map<string, string> {
        return this._brainStructureColorMap;
    }

    public get TracingStructures(): ITracingStructure[] {
        return this._tracingStructures;
    }

    public findBrainArea(id: string | number): IBrainArea | undefined {
        if (typeof (id) === "string")
            return this._brainAreaIdMap.get(id);
        else
            return this._brainAreaStructureIdMap.get(id);
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

    private loadBrainAreas(brainAreas: IBrainArea[]): void {
        brainAreas.map(b => {
            this._brainAreaIdMap.set(b.id, b);
            this._brainAreaStructureIdMap.set(b.structureId, b);
        });

        this._BrainAreas = Array.from(this._brainAreaIdMap.values());

        this._brainAreasWithGeometry = this.BrainAreas.filter(b => b.geometryEnable).sort((a: IBrainArea, b: IBrainArea) => {
            if (a.depth === b.depth) {
                return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
            }

            return a.depth - b.depth;
        });

        this._BrainAreas.forEach(b => {
            if (b.geometryEnable) {
                this._brainStructureColorMap[b.structureId.toString()] = "#" + b.geometryColor;
            }
        });
    }

    private loadStructureIdentifiers(structures: IStructureIdentifier[]) {
        structures.map(s => this._structureIdentifierMap.set(s.id, s));
    }

    private loadTracingStructures(tracingStructures: ITracingStructure[]) {
        this._tracingStructures = tracingStructures;
    }

    private loadNeuronalStructures(ts: ITracingStructure[], si: IStructureIdentifier[]) {
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("fc6ba542-1a5d-417a-b33e-8eb23b96e473", TracingStructure.any, ts, StructureIdentifier.soma, si));
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("bd3a8d75-12dd-4152-8f1c-2cd0119679dd", TracingStructure.axon, ts, StructureIdentifier.any, si));
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("f42cee66-4ec6-420e-a22f-e54ff82f031e", TracingStructure.axon, ts, StructureIdentifier.forkPoint, si));
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("d4fe500f-01fe-47b8-91c4-42d1550115cd", TracingStructure.axon, ts, StructureIdentifier.endPoint, si));
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("8f993619-b916-4a42-aa9e-518e9715d819", TracingStructure.dendrite, ts, StructureIdentifier.any, si));
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("bf239333-0df6-4bec-90dc-f47bdb2bdf40", TracingStructure.dendrite, ts, StructureIdentifier.forkPoint, si));
        this._NeuronStructures.push(this.makeNeuronalStructurePairing("adc95a87-d80e-4058-8ea1-7d11766c0188", TracingStructure.dendrite, ts, StructureIdentifier.endPoint, si));
    }

    private makeNeuronalStructurePairing(id: string, tsValue: number, ts: ITracingStructure[], siValue: number, si: IStructureIdentifier[]): NeuronalStructure {
        const pair = new NeuronalStructure(id, si.find(s => s.value === siValue) || null, ts.find(t => t.value === tsValue) || null);

        this._neuronStructureMap.set(pair.id, pair);

        return pair;
    }

    private loadQueryOperators(queryOperators: IQueryOperator[]) {
        this._QueryOperators = queryOperators;

        this._QueryOperators.map(q => this._queryOperatorMap.set(q.id, q));
    }
}
