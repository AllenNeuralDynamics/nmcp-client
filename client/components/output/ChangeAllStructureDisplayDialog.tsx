import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import {Button, Modal} from "semantic-ui-react";

import {NEURON_VIEW_MODES, NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {TracingViewModeSelect} from "../query/editors/TracingViewModeSelect";

interface IChangeAllStructureDisplayDialogProps {
    show: boolean
    defaultStructureSelection: NeuronViewMode;

    onCancel(): void;
    onAccept(mode: NeuronViewMode): void;
}

export const ChangeAllStructureDisplayDialog: React.FC<IChangeAllStructureDisplayDialogProps> = (props) => {
    const [structureSelection, setStructureSelection] = useState<NeuronViewMode>(props.defaultStructureSelection);

    // Update structureSelection when defaultStructureSelection prop changes
    useEffect(() => {
        setStructureSelection(props.defaultStructureSelection);
    }, [props.defaultStructureSelection]);

    const onViewModeChange = useCallback((viewMode: NeuronViewMode) => {
        setStructureSelection(viewMode);
    }, []);

    const handleAccept = useCallback(() => {
        props.onAccept(structureSelection);
    }, [props.onAccept, structureSelection]);

    return (
        <Modal open={props.show} onClose={props.onCancel}>
            <Modal.Header content="Set Display Structures"/>
            <Modal.Content>
                Update the all neurons to display
                <TracingViewModeSelect idName="view-mode"
                                       options={NEURON_VIEW_MODES}
                                       placeholder="any"
                                       clearable={false}
                                       searchable={false}
                                       selectedOption={structureSelection}
                                       onSelect={onViewModeChange}/>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={props.onCancel}>Cancel</Button>
                <Button onClick={handleAccept}>Ok</Button>
            </Modal.Actions>
        </Modal>
    );
};
