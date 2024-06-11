import * as React from "react";
import {Button, Modal} from "semantic-ui-react";

import {NEURON_VIEW_MODES, NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {TracingViewModeSelect} from "../query/editors/TracingViewModeSelect";

interface IChangeAllStructureDisplayDialogProps {
    show: boolean
    defaultStructureSelection: NeuronViewMode;

    onCancel(): void;
    onAccept(mode: NeuronViewMode): void;
}

interface IChangeAllStructureDisplayDialogState {
    structureSelection: NeuronViewMode;
}

export class ChangeAllStructureDisplayDialog extends React.Component<IChangeAllStructureDisplayDialogProps, IChangeAllStructureDisplayDialogState> {
    public constructor(props: IChangeAllStructureDisplayDialogProps) {
        super(props);

        this.state = {structureSelection: props.defaultStructureSelection};
    }
    private onViewModeChange(viewMode: NeuronViewMode) {
        this.setState({structureSelection: viewMode});
    }

    public render() {
        return (
            <Modal open={this.props.show} onClose={this.props.onCancel}>
                <Modal.Header content="Set Display Structures"/>
                <Modal.Content>
                    Update the all neurons to display
                    <TracingViewModeSelect idName="view-mode"
                                           options={NEURON_VIEW_MODES}
                                           placeholder="any"
                                           clearable={false}
                                           searchable={false}
                                           selectedOption={this.state.structureSelection}
                                           onSelect={(v: NeuronViewMode) => this.onViewModeChange(v)}/>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.props.onCancel}>Cancel</Button>
                    <Button onClick={() => this.props.onAccept(this.state.structureSelection)}>Ok</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}
