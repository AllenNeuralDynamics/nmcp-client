import {action, makeObservable, observable} from "mobx";
import {ApolloClient} from "@apollo/client";
import cuid from "cuid";

import {NdbConstants} from "../models/constants";
import {QUERY_PREDICATE_KIND_COMPARTMENT} from "./queryPredicateKind";
import {SEARCH_NEURONS_QUERY, SearchContext, SearchNeuronsQueryResponse, SearchNeuronsQueryVariables} from "../graphql/search";
import {FilterContents} from "./filterContents";
import {UserPreferences} from "../util/userPreferences";
import {QueryResponseViewModel} from "./queryResponseViewModel";
import {UIQueryPredicate} from "./uiQueryPredicate";

export class UIQuery {
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
                predicates: this.predicates.map(f => f.asSearchPredicate())
            };

            const {data, error} = await client.query<SearchNeuronsQueryResponse, SearchNeuronsQueryVariables>({
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

export const DEFAULT_QUERY_FILTER: UIQueryPredicate = Object.assign(new UIQueryPredicate(), {
    id: "",
    index: 0,
    brainAreaFilterType: QUERY_PREDICATE_KIND_COMPARTMENT,
    filter: new FilterContents(true)
});
