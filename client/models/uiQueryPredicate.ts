import {
    BRAIN_AREA_FILTER_TYPE_COMPARTMENT,
    BrainAreaFilterType,
    PredicateType,
    findBrainAreaFilterType
} from "./brainAreaFilterType";
import {SearchPredicate} from "../graphql/search";
import {NdbConstants} from "./constants";
import {FilterContents, IPosition, IPositionInput} from "./queryFilter";
import cuid from "cuid";

export type PredicateListenerFcn = (predicates: UIQueryPredicates) => void;

export class UIQueryPredicates {
    private _predicates: UIQueryPredicate[] = [];

    private _predicateListener: PredicateListenerFcn = null;

    public constructor(predicates: UIQueryPredicate[], constants: NdbConstants) {
        if (predicates && predicates.length > 0) {
            this._predicates = predicates.map(f => {
                return UIQueryPredicate.deserialize(f, constants);
            });
        } else {
            this._predicates = [Object.assign(new UIQueryPredicate(), DEFAULT_QUERY_FILTER, {id: cuid()})];
        }
    }

    public get Predicates(): UIQueryPredicate[] {
        return this._predicates.slice();
    }

    public set PredicateListener(fcn: PredicateListenerFcn) {
        this._predicateListener = fcn;
    }

    public addPredicate(uiModifiers: any = {}, predicateModifiers: any = {}) {
        const predicate = Object.assign(new UIQueryPredicate(), DEFAULT_QUERY_FILTER, {
            id: cuid(),
            index: this._predicates.length,
            filter: Object.assign(new FilterContents(this._predicates.length === 0), predicateModifiers)
        }, uiModifiers);

        this._predicates.push(predicate);

        this.onChanged();
    }

    public removePredicate(id: string) {
        this._predicates = this._predicates.filter(q => q.id !== id).map((q, idx) => {
            q.index = idx;
            return q;
        });

        this.onChanged();
    }

    public clearPredicates() {
        this._predicates = [Object.assign(new UIQueryPredicate(), {
            id: "",
            index: 0,
            brainAreaFilterType: BRAIN_AREA_FILTER_TYPE_COMPARTMENT,
            filter: new FilterContents(true)
        }, {id: cuid()})];

        this.onChanged();
    }

    public replacePredicate(filter: UIQueryPredicate) {
        if (this._predicates.length > filter.index) {
            this._predicates[filter.index] = filter;
            this.onChanged();
        }
    }

    private onChanged() {
        if (this._predicateListener) {
            this._predicateListener(this);
        }
    }
}

export class UIQueryPredicate {
    id: string;
    index: number;
    brainAreaFilterType: BrainAreaFilterType;
    filter: FilterContents;

    public asFilterInput(): SearchPredicate {
        const amount = this.filter.amount.length === 0 ? 0 : parseFloat(this.filter.amount);

        const n = this.filter.neuronalStructure;

        const tracingStructureId = n ? n.TracingStructureId : null;
        const nodeStructureId = n ? n.StructureIdentifierId : null;
        const operatorId = n && n.IsSoma ? null : (this.filter.operator ? this.filter.operator.id : null);

        return {
            predicateType: this.brainAreaFilterType.value,
            tracingIdsOrDOIs: this.brainAreaFilterType.IsIdQuery ? this.filter.tracingIdsOrDOIs.split(",").map(s => s.trim()).filter(s => s.length > 0) : [],
            tracingIdsOrDOIsExactMatch: this.filter.tracingIdsOrDOIsExactMatch,
            tracingStructureIds: tracingStructureId ? [tracingStructureId] : [],
            nodeStructureIds: nodeStructureId ? [nodeStructureId] : [],
            operatorId,
            amount: isNaN(amount) ? null : amount,
            brainAreaIds: this.brainAreaFilterType.IsCompartmentQuery ? this.filter.brainAreas.map(b => b.id) : [],
            arbCenter: createPositionInput(this.brainAreaFilterType.IsCustomRegionQuery, this.filter.arbCenter),
            arbSize: arbNumberToString(this.brainAreaFilterType.IsCustomRegionQuery, this.filter.arbSize),
            invert: this.filter.invert,
            composition: this.filter.composition
        };
    }

    public serialize() {
        return {
            id: this.id,
            index: this.index,
            brainAreaFilterTypeOption: this.brainAreaFilterType.option,
            filter: this.filter ? this.filter.serialize() : null
        }
    }

    public static deserialize(data: any, constants: NdbConstants): UIQueryPredicate {
        const filter = new UIQueryPredicate();

        filter.id = data.id || "";
        filter.index = data.index || 0;
        filter.brainAreaFilterType = findBrainAreaFilterType(data.brainAreaFilterTypeOption || PredicateType.AnatomicalRegion);

        filter.filter = data.filter ? FilterContents.deserialize(data.filter, constants) : null;

        return filter;
    }
}

export const DEFAULT_QUERY_FILTER: UIQueryPredicate = Object.assign(new UIQueryPredicate(), {
    id: "",
    index: 0,
    brainAreaFilterType: BRAIN_AREA_FILTER_TYPE_COMPARTMENT,
    filter: new FilterContents(true)
});

function arbNumberToString(isCustomRegion: boolean, valueStr: string): number {
    const value = valueStr.length === 0 ? 0 : parseFloat(valueStr);

    return !isCustomRegion || isNaN(value) ? null : value;
}

function createPositionInput(isCustomRegion: boolean, center: IPosition): IPositionInput {
    return {
        x: arbNumberToString(isCustomRegion, center.x),
        y: arbNumberToString(isCustomRegion, center.y),
        z: arbNumberToString(isCustomRegion, center.z),
    }
}
