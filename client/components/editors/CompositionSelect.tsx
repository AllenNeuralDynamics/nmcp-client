import * as React from "react";

import {DynamicSimpleSelect} from "./DynamicSelect";

export class CompositionSelect extends DynamicSimpleSelect<any> {
    protected selectLabelForOption(option: any): any {
        return option.label;
    }

    protected staticDisplayForOption(option: any): any {
        return option.label;
    }

    protected isSelectedOption(object: any, selectedOption: any) {
        return object.value === selectedOption.value;
    }

    protected selectValueForOption(option: any): string | number {
        return option.value;
    }

    protected findSelectedObject(option: any): any {
        return option ? this.props.options.find(s => s.value === option.value) : null;
    }
}
