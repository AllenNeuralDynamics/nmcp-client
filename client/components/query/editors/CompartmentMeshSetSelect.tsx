import {DynamicSimpleSelect} from "./DynamicSelect";
import {CompartmentMeshSet} from "../../../models/compartmentMeshSet";

export class CompartmentMeshSetSelect extends DynamicSimpleSelect<CompartmentMeshSet> {
    protected selectLabelForOption(option: CompartmentMeshSet): any {
        return option.Name;
    }
}
