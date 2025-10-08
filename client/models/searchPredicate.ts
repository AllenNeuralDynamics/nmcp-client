import {IPositionInput} from "../viewmodel/filterContents";

export enum PredicateTypeValue {
    AnatomicalRegion = "ANATOMICAL",
    CustomRegion = "CUSTOM",
    IdOrDoi = "ID",
}

export type SearchPredicate = {
    predicateType: PredicateTypeValue;
    tracingIdsOrDOIs: string[];
    tracingIdsOrDOIsExactMatch: boolean;
    tracingStructureIds: string[];
    nodeStructureIds: string[];
    operatorId: string;
    amount: number;
    brainAreaIds: string[];
    arbCenter: IPositionInput;
    arbSize: number;
    invert: boolean;
    composition: number;
}
