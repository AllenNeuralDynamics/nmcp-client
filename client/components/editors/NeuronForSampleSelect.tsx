import * as React from "react";
import {Dropdown, DropdownItemProps} from "semantic-ui-react";

import {displayNeuronWithBrainStructure, INeuron} from "../../models/neuron";

type INeuronForSampleSelectProps = {
    loading: boolean;
    neurons: INeuron[];
    selectedNeuron: INeuron;
    disabled?: boolean;

    onNeuronChange?(neuron: INeuron): void;
}


export class NeuronForSampleSelect extends React.Component<INeuronForSampleSelectProps, {}> {

    private onNeuronChange(neuronId: string) {
        if (!this.props.selectedNeuron || neuronId !== this.props.selectedNeuron.id) {
            this.props.onNeuronChange(this.props.neurons.find((s) => s.id === neuronId) || null);
        }
    }

    public render() {
        const neurons = this.props.neurons || [];

        const neuronOptions: DropdownItemProps[] = neurons.map(n => {
            return {
                key: n.id,
                text: displayNeuronWithBrainStructure(n),
                value: n.id
            }
        });

        return (
            <Dropdown
                loading={this.props.loading}
                placeholder={"Select a neuron..."}
                fluid selection options={neuronOptions}
                value={this.props.selectedNeuron ? this.props.selectedNeuron.id : null}
                disabled={this.props.disabled || neurons.length === 0 || this.props.loading}
                onChange={(e, {value}) => this.onNeuronChange(value as string)}/>
        );
    }
}
