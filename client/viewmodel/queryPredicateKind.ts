import {PredicateTypeValue} from "../models/searchPredicate";

export enum PredicateType {
    AnatomicalRegion = 1,
    CustomRegion = 2,
    IdOrDoi = 3
}

export class QueryPredicateKind {
    id: string;
    name: string;
    option: PredicateType;
    value: PredicateTypeValue;

    public constructor(id: string, name: string, option: PredicateType, value: PredicateTypeValue) {
        this.id = id;
        this.name = name;
        this.option = option;
        this.value = value;
    }

    public get IsCompartmentQuery(): boolean {
        return this.option === PredicateType.AnatomicalRegion;
    }

    public get IsCustomRegionQuery(): boolean {
        return this.option === PredicateType.CustomRegion;
    }

    public get IsIdQuery(): boolean {
        return this.option === PredicateType.IdOrDoi;
    }
}

export let QUERY_PREDICATE_KIND_COMPARTMENT: QueryPredicateKind | null = null;
export let QUERY_PREDICATE_KIND_SPHERE: QueryPredicateKind | null = null;
export let QUERY_PREDICATE_KIND_ID: QueryPredicateKind | null = null;

const queryPredicateKindLookup = new Map<number, QueryPredicateKind>();

export const QUERY_PREDICATE_KINDS: QueryPredicateKind[] = makeQueryPredicateKinds();

export function findQueryPredicateKind(option: PredicateType) {
    return queryPredicateKindLookup.get(option);
}

function makeQueryPredicateKinds(): QueryPredicateKind[] {

    const modes: QueryPredicateKind[] = [];

    QUERY_PREDICATE_KIND_COMPARTMENT = new QueryPredicateKind("c7c6a2c7-e92a-4c3b-8308-cef92114ecbb", "Anatomical Region", PredicateType.AnatomicalRegion, PredicateTypeValue.AnatomicalRegion);
    modes.push(QUERY_PREDICATE_KIND_COMPARTMENT);

    QUERY_PREDICATE_KIND_SPHERE = new QueryPredicateKind("4780c646-f31b-42e6-bdf1-ff381b212e82", "Custom Region", PredicateType.CustomRegion, PredicateTypeValue.CustomRegion);
    modes.push(QUERY_PREDICATE_KIND_SPHERE);

    QUERY_PREDICATE_KIND_ID = new QueryPredicateKind("10e81282-b7b9-4deF-b894-797e52780306", "Id or DOI", PredicateType.IdOrDoi, PredicateTypeValue.IdOrDoi);
    modes.push(QUERY_PREDICATE_KIND_ID);

    modes.map(m => {
        queryPredicateKindLookup.set(m.option, m);
    });

    return modes;
}
