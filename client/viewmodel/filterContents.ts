import {computed, makeAutoObservable, makeObservable, observable} from "mobx";

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
    brainAreaStructureIds: number[];
    arbCenter: IPosition;
    arbSize: string;
    composition: PredicateComposition;
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
            brainAreaStructureIds: this.brainAreas.map(b => b.structureId),
            arbCenter: this.arbCenter,
            arbSize: this.arbSize,
            composition: this.composition
        }
    }

    public static deserialize(data: PredicateState, constants: DataConstants): FilterContents {
        const filter = new FilterContents();

        filter.labelsOrDois = data.labelsOrDois || "";
        filter.tracingIdsOrDOIsExactMatch = data.tracingIdsOrDOIsExactMatch == null ? true : data.tracingIdsOrDOIsExactMatch;
        filter.neuronalStructure = constants.findNeuronalStructure(data.neuronalStructureId);
        filter.operator = constants.findQueryOperator(data.operatorId);
        filter.amount = data.amount || "0";
        filter.brainAreas = data.brainAreaStructureIds ? data.brainAreaStructureIds.map(s => constants.AtlasConstants.findStructure(s)) : [];
        filter.arbCenter = data.arbCenter || {x: "6500", y: "4000", z: "5500"};
        filter.arbSize = data.arbSize || "1000";
        filter.composition = data.composition || PredicateComposition.and;

        return filter;
    }
}
