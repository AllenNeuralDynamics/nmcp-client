import * as React from "react";
import {observer} from "mobx-react-lite";
import {Modal, Select} from "@mantine/core";

import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";
import {NEURON_VIEW_MODES, NeuronViewMode} from "../../../viewmodel/neuronViewMode";
import {useState} from "react";

type NeuronViewModelModalProps = {
    opened: boolean

    close(): void;
}

const neuronViewModelLookup = new Map<string, NeuronViewMode>();
const neuronViewModeOptions = NEURON_VIEW_MODES.map(n => {
    neuronViewModelLookup.set(n.id, n);
    return {label: n.text, value: n.id}
})

export const NeuronViewModelModal = observer<NeuronViewModelModalProps>((props) => {
    const queryViewModel = useQueryResponseViewModel();
    const [mode, setMode] = useState<string>(null);

    const onChange = (value: string) => {
        setMode(value);
        if (value) {
            queryViewModel.setDefaultNeuronViewMode(neuronViewModelLookup.get(value));
        }
    }

    const onClose = () => {
        setMode(null);
        props.close();
    }

    return (
        <Modal size="auto" centered title="Set Neuron View Mode" opened={props.opened} onClose={onClose}>
            <Select label="Update all neurons to display" allowDeselect={false} data={neuronViewModeOptions} value={mode}
                    onChange={onChange}/>
        </Modal>
    );
});
