import {DynamicSimpleSelect} from "./DynamicSelect";
import {BrainAreaFilterType} from "../../../../models/brainAreaFilterType";


export class BrainAreaFilterTypeSelect extends DynamicSimpleSelect<BrainAreaFilterType> {
    protected selectLabelForOption(option: BrainAreaFilterType): any {
        return option ? option.name : "";
    }
}
