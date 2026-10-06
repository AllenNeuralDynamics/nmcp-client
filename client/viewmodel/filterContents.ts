import {makeAutoObservable} from "mobx";

import {IQueryOperator} from "../models/queryOperator";
import {AtlasStructureShape} from "../models/atlasStructure";
import {NeuronalStructure} from "../models/neuronalStructure";
import {DataConstants} from "../models/constants";

export enum PredicateComposition {
    and = 1,
    or = 2,
    not = 3
}

export const PredicateCompositions = [
    {label: "and", value: PredicateComposition.and},
    {label: "or", value: PredicateComposition.or},
    {label: "not", value: PredicateComposition.not}
];

export interface IPositionInput {
    x: number;
    y: number;
    z: number;
}

export interface IPosition {
    x: string;
    y: string;
    z: string;

    [key: string]: string;
}

export type PredicateState = {
    labelsOrDois: string;
    tracingIdsOrDOIsExactMatch: boolean;
    neuronalStructureId: string;
    operatorId: string;
    amount: string;
    atlasStructureIds?: string[];
    // Read from state saved before structure ids; never written.
    brainAreaStructureIds?: number[];
    arbCenter: IPosition;
    arbSize: string;
    composition: PredicateComposition;
}

export type RestoreTally = {
    unresolvedStructures: number;
}

// TODO This is from an older version of the API that has been subsumed by UIQueryPredicate and is now used as a child in that class.  Some refactor is needed
// to consolidate.
export class FilterContents {
    public labelsOrDois: string;
    public tracingIdsOrDOIsExactMatch: boolean;
    public neuronalStructure: NeuronalStructure;
    public operator: IQueryOperator;
    public amount: string;
    public brainAreas: AtlasStructureShape[];
    public arbCenter: IPosition;
    public arbSize: string;
    public composition: PredicateComposition;
    public nonce: string;

    public constructor(isDefaultQuery: boolean = false) {
        this.labelsOrDois = "";
        this.tracingIdsOrDOIsExactMatch = true;
        this.neuronalStructure = null;
        this.operator = null;
        this.amount = "0";
        this.brainAreas = [];
        this.arbCenter = {x: "6500", y: "4000", z: "5500"};
        this.arbSize = "1000";
        this.composition = isDefaultQuery ? PredicateComposition.or : PredicateComposition.and;
        this.nonce = null;

        makeAutoObservable(this);
    }

    public get IsAmountValid(): boolean {
        return (this.amount.length !== 0) && !isNaN(parseFloat(this.amount));
    }

    public get CanHaveThreshold(): boolean {
        return !this.neuronalStructure || !this.IsSoma;
    }

    public get IsSoma(): boolean {
        return this.neuronalStructure?.IsSoma;
    }

    public amountUnits(): string {
        if (!this.neuronalStructure) {
            return "nodes";
        }

        if (this.neuronalStructure.tracingStructure && !this.neuronalStructure.IsSoma) {
            if (!this.neuronalStructure.structureIdentifier) {
                return "µm";
            }
        }

        if (!this.neuronalStructure.IsSoma) {
            return "nodes";
        }

        return "";
    }

    public updateNeuronalStructure(neuronalStructure: NeuronalStructure) {
        this.neuronalStructure = neuronalStructure;
    }

    public serialize(): PredicateState {
        return {
            labelsOrDois: this.labelsOrDois,
            tracingIdsOrDOIsExactMatch: this.tracingIdsOrDOIsExactMatch,
            neuronalStructureId: this.neuronalStructure ? this.neuronalStructure.id : null,
            operatorId: this.operator ? this.operator.id : null,
            amount: this.amount,
            atlasStructureIds: this.brainAreas.map(b => b.id),
            arbCenter: this.arbCenter,
            arbSize: this.arbSize,
            composition: this.composition
        }
    }

    public static deserialize(data: PredicateState, constants: DataConstants, tally: RestoreTally = null): FilterContents {
        const filter = new FilterContents();

        filter.labelsOrDois = data.labelsOrDois || "";
        filter.tracingIdsOrDOIsExactMatch = data.tracingIdsOrDOIsExactMatch == null ? true : data.tracingIdsOrDOIsExactMatch;
        filter.neuronalStructure = constants.findNeuronalStructure(data.neuronalStructureId);
        filter.operator = constants.findQueryOperator(data.operatorId);
        filter.amount = data.amount || "0";
        filter.brainAreas = FilterContents.restoreStructures(data, constants, tally);
        filter.arbCenter = data.arbCenter || {x: "6500", y: "4000", z: "5500"};
        filter.arbSize = data.arbSize || "1000";
        filter.composition = data.composition || PredicateComposition.and;

        return filter;
    }

    private static restoreStructures(data: PredicateState, constants: DataConstants, tally: RestoreTally): AtlasStructureShape[] {
        let requested: AtlasStructureShape[];

        // An empty new-format list means "no structures" and must not fall through to the legacy ids.
        if (Array.isArray(data.atlasStructureIds)) {
            requested = data.atlasStructureIds.map(id => constants.findAtlasStructure(id));
        } else if (Array.isArray(data.brainAreaStructureIds)) {
            // Legacy ids are CCFv3 numbers. Without a Mouse atlas they stay unresolved rather than being read
            // against an atlas where the same numbers name other structures.
            requested = data.brainAreaStructureIds.map(n => constants.DefaultAtlas?.findStructure(n));
        } else {
            requested = [];
        }

        const resolved = requested.filter(s => s != null);

        if (tally) {
            tally.unresolvedStructures += requested.length - resolved.length;
        }

        return resolved;
    }
}
