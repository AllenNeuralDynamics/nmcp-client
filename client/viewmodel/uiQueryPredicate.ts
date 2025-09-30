import {action, makeObservable, observable} from "mobx";
import cuid from "cuid";

import {NdbConstants} from "../models/constants";
import {BRAIN_AREA_FILTER_TYPE_COMPARTMENT, BrainAreaFilterType, PredicateType, findBrainAreaFilterType} from "../models/brainAreaFilterType";
import {SEARCH_NEURONS_QUERY, SearchContext, SearchPredicate} from "../graphql/search";
import {FilterContents, IPosition, IPositionInput} from "./queryFilter";
import {UserPreferences} from "../util/userPreferences";
import {QueryResponseViewModel} from "./queryResponseViewModel";
import {ApolloClient} from "@apollo/client";

export class UIQueryPredicates {
    public resetCount: number = 0;

    public predicates: UIQueryPredicate[] = [];

    private _constants: NdbConstants = null;

    public constructor() {
        makeObservable(this, {
            resetCount: observable,
            predicates: observable,
            reset: action,
            addPredicate: action,
            removePredicate: action,
            replacePredicate: action,
            execute: action
        });

        this.reset();
    }

    public reset() {
        this.resetCount++;

        this.predicates = [Object.assign(new UIQueryPredicate(), DEFAULT_QUERY_FILTER, {id: cuid()})];
    }

    public set Constants(constants: NdbConstants) {
        this._constants = constants;
    }

    public deserializePredicates(serializedPredicates: any[]) {
        if (serializedPredicates && serializedPredicates.length > 0 && this._constants) {
            this.predicates = serializedPredicates.map(f => {
                return UIQueryPredicate.deserialize(f, this._constants);
            });
        }
    }

    public addPredicate(uiModifiers: any = {}, predicateModifiers: any = {}) {
        const predicate = Object.assign(new UIQueryPredicate(), DEFAULT_QUERY_FILTER, {
            id: cuid(),
            index: this.predicates.length,
            filter: Object.assign(new FilterContents(this.predicates.length === 0), predicateModifiers)
        }, uiModifiers);

        this.predicates.push(predicate);
    }

    public removePredicate(id: string) {
        this.predicates = this.predicates.filter(q => q.id !== id).map((q, idx) => {
            q.index = idx;
            return q;
        });
    }

    public replacePredicate(filter: UIQueryPredicate) {
        if (this.predicates.length > filter.index) {
            this.predicates[filter.index] = filter;
        }
    }

    public async execute(queryResponseViewModel: QueryResponseViewModel, client: ApolloClient<object>) {
        queryResponseViewModel.initiate(cuid());

        try {
            UserPreferences.Instance.AppendQueryHistory(this.predicates);

            const context: SearchContext = {
                nonce: queryResponseViewModel.queryNonce,
                predicates: this.predicates.map(f => f.asFilterInput())
            };

            const {data, error} = await client.query({
                query: SEARCH_NEURONS_QUERY,
                variables: {context}
            });

            if (error) {
                queryResponseViewModel.errored(error);
                console.error(error);
                return;
            }

            queryResponseViewModel.update(data.searchNeurons.queryTime, data.searchNeurons.neurons, data.searchNeurons.totalCount);
        } catch (err) {
            console.error(err);
        }
    }
}

export class UIQueryPredicate {
    id: string = "";
    index: number = 0;
    brainAreaFilterType: BrainAreaFilterType = BRAIN_AREA_FILTER_TYPE_COMPARTMENT;
    filter: FilterContents = null;

    public constructor() {
        makeObservable(this, {
            id: observable,
            index: observable,
            brainAreaFilterType: observable,
            filter: observable
        })
    }

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
