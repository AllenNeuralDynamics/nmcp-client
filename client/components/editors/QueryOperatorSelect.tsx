import * as React from "react";

import {DynamicSimpleSelect} from "./DynamicSelect";
import {displayQueryOperator, IQueryOperator} from "../../models/queryOperator";

export class QueryOperatorSelect extends DynamicSimpleSelect<IQueryOperator> {
    protected selectLabelForOption(option: IQueryOperator): any {
        return displayQueryOperator(option);
    }
}
