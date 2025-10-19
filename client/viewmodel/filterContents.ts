import {IQueryOperator} from "../models/queryOperator";
import {AtlasStructureShape} from "../models/atlasStructure";
import {NeuronalStructure} from "../models/neuronalStructure";
import {DataConstants} from "../models/constants";
import {makeObservable, observable} from "mobx";

export enum FilterComposition {
    and = 1,
    or = 2,
    not = 3
}

export const FilterCompositions = [
    {label: "and", value: FilterComposition.and},
    {label: "or", value: FilterComposition.or},
    {label: "not", value: FilterComposition.not}
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

// TODO This is from an older version of the API that has been subsumed by UIQueryPredicate and is now used as a child in that class.  Some refactor is needed
// to consolidate.
export class FilterContents {
    public tracingIdsOrDOIs: string;
    public tracingIdsOrDOIsExactMatch: boolean;
    public neuronalStructure: NeuronalStructure;
    public operator: IQueryOperator;
    public amount: string;
    public brainAreas: AtlasStructureShape[];
    public arbCenter: IPosition;
    public arbSize: string;
    public invert: boolean;
    public composition: FilterComposition;
    public nonce: string;

    public constructor(isDefaultQuery: boolean = false) {
        this.tracingIdsOrDOIs = "";
        this.tracingIdsOrDOIsExactMatch = true;
        this.neuronalStructure = null;
        this.operator = null;
        this.amount = "0";
        this.brainAreas = [];
        this.arbCenter = {x: "6500", y: "4000", z: "5500"};
        this.arbSize = "1000";
        this.invert = false;
        this.composition = isDefaultQuery ? FilterComposition.or : FilterComposition.and;
        this.nonce = null;

        makeObservable(this, {
            tracingIdsOrDOIs: observable,
            tracingIdsOrDOIsExactMatch: observable,
            neuronalStructure: observable,
            operator: observable,
            amount: observable,
            brainAreas: observable,
            arbCenter: observable,
            arbSize: observable,
            invert: observable,
            composition: observable,
            nonce: observable
        });
    }

    public get IsAmountValid(): boolean {
        return (this.amount.length !== 0) && !isNaN(parseFloat(this.amount));
    }

    public get CanHaveThreshold(): boolean {
        return !this.neuronalStructure || !this.neuronalStructure.IsSoma;
    }

    public get IsSoma(): boolean {
        return this.neuronalStructure.IsSoma;
    }

    public serialize() {
        return {
            tracingIdsOrDOIs: this.tracingIdsOrDOIs,
            tracingIdsOrDOIsExactMatch: this.tracingIdsOrDOIsExactMatch,
            neuronalStructureId: this.neuronalStructure ? this.neuronalStructure.id : null,
            operatorId: this.operator ? this.operator.id : null,
            amount: this.amount,
            brainAreaStructureIds: this.brainAreas.map(b => b.structureId),
            arbCenter: this.arbCenter,
            arbSize: this.arbSize,
            invert: this.invert,
            composition: this.composition
        }
    }

    public static deserialize(data: any, constants: DataConstants): FilterContents {
        const filter = new FilterContents();

        filter.tracingIdsOrDOIs = data.tracingIdsOrDOIs || "";
        filter.tracingIdsOrDOIsExactMatch = data.tracingIdsOrDOIsExactMatch == null ? true : data.tracingIdsOrDOIsExactMatch;
        filter.neuronalStructure = constants.findNeuronalStructure(data.neuronalStructureId);
        filter.operator = constants.findQueryOperator(data.operatorId);
        filter.amount = data.amount || "0";
        filter.brainAreas = data.brainAreaStructureIds ? data.brainAreaStructureIds.map(s => constants.AtlasConstants.findStructure(s)) : [];
        filter.arbCenter = data.arbCenter || {x: "6500", y: "4000", z: "5500"};
        filter.arbSize = data.arbSize || "1000";
        filter.invert = data.invert || false;
        filter.composition = data.composition || FilterComposition.and;

        return filter;
    }
}
