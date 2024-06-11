import * as React from "react";
import {Dropdown, DropdownItemProps, Form, Grid} from "semantic-ui-react";
import {INeuron} from "../../../models/neuron";
import {displayTracingStructure, ITracingStructure} from "../../../models/tracingStructure";
import {NeuronForSampleSelect} from "../../editors/NeuronForSampleSelect";
import {NeuronPreview} from "./NeuronPreview";

export type TracingInputProps = {
    isLoading: boolean;
    isSwcFile: boolean;

    selectedNeuron: INeuron;
    selectedTracingStructure: ITracingStructure;

    neurons: INeuron[]
    tracingStructures: ITracingStructure[];

    onNeuronChanged(neuron: INeuron): void;
    onTracingStructureChanged(id: string): void;
}

export const TracingInput = (props: TracingInputProps) => {
    const tracingStructureOptions: DropdownItemProps[] = props.tracingStructures.map(t => {
        return {
            key: t.id,
            text: displayTracingStructure(t),
            value: t.id
        }
    });

    const structureDropDown = props.isSwcFile ? (<Dropdown placeholder={"Select structure..."} fluid={true} selection
                                                           options={tracingStructureOptions}
                                                           value={props.selectedTracingStructure ? props.selectedTracingStructure.id : null}
                                                           disabled={props.isLoading}
                                                           onChange={(_, {value}) => props.onTracingStructureChanged(value as string)}/>) : null

    return (
        <Grid fluid="true">
            <Grid.Row>
                <Grid.Column width={8}>
                    <Form>
                        <Form.Field>
                            <label>Neuron</label>
                        </Form.Field>
                    </Form>
                </Grid.Column>
                <Grid.Column width={8}>
                    <Form>
                        <Form.Field>
                            {props.isSwcFile ? <label>Structure</label> : null}
                        </Form.Field>
                    </Form>
                </Grid.Column>
            </Grid.Row>

            <Grid.Row style={{paddingTop: 0}}>
                <Grid.Column width={8}>
                    <NeuronForSampleSelect loading={props.isLoading} neurons={props.neurons}
                                           selectedNeuron={props.selectedNeuron}
                                           onNeuronChange={n => props.onNeuronChanged(n)}
                                           disabled={props.isLoading}/>
                    <NeuronPreview neuron={props.selectedNeuron}/>
                </Grid.Column>
                <Grid.Column width={8}>
                    {structureDropDown}
                    <p/>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}
