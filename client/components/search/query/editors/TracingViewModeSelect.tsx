import {DynamicSimpleSelect} from "./DynamicSelect";
import {NeuronViewMode} from "../../../../viewmodel/neuronViewMode";

export class TracingViewModeSelect extends DynamicSimpleSelect<NeuronViewMode> {
    protected selectLabelForOption(option: NeuronViewMode): any {
        return option ? option.id : "";
    }
}
