import {DynamicSimpleSelect} from "./DynamicSelect";
import {QueryPredicateKind} from "../../../../viewmodel/queryPredicateKind";


export class QueryPredicateKindSelect extends DynamicSimpleSelect<QueryPredicateKind> {
    protected selectLabelForOption(option: QueryPredicateKind): any {
        return option ? option.name : "";
    }
}
