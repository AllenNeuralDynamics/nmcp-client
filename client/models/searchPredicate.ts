import {FilterComposition, IPositionInput} from "../viewmodel/filterContents";

export enum PredicateTypeValue {
    AnatomicalRegion = "ANATOMICAL",
    CustomRegion = "CUSTOM",
    IdOrDoi = "ID",
}

export type SearchPredicate = {
    predicateType: PredicateTypeValue;
    labelsOrDois: string[];
    labelOrDoiExactMatch: boolean;
    neuronStructureIds: string[];
    nodeStructureIds: string[];
    operatorId: string;
    amount: number;
    atlasStructureIds: string[];
    arbCenter: IPositionInput;
    arbSize: number;
    composition: FilterComposition;
}
