import {PredicateComposition, IPositionInput} from "../viewmodel/filterContents";

export enum PredicateTypeValue {
    AnatomicalRegion = "ANATOMICAL",
    CustomRegion = "CUSTOM",
    IdOrDoi = "ID",
}

export type AnatomicalPredicateInput = {
    neuronStructureId: string;
    nodeStructureId: string;
    operatorId: string;
    amount: number;
    atlasStructureIds: string[];
}

export type CustomRegionPredicateInput = {
    arbCenter: IPositionInput;
    arbSize: number;
}

export type IdOrDoiPredicateInput = {
    labelsOrDois: string[];
    labelOrDoiExactMatch: boolean;
}

export type SearchPredicate = {
    predicateType: PredicateTypeValue;
    composition: PredicateComposition;
    anatomicalPredicate?: AnatomicalPredicateInput;
    customRegionPredicate?: CustomRegionPredicateInput;
    idOrDoiPredicate?: IdOrDoiPredicateInput;
}
