import * as React from "react";
import {Card, Label, List} from "semantic-ui-react";

import {displaySampleAnimal, ISample} from "../../../models/sample";
import {displayInjection, IInjection} from "../../../models/injection";
import {INeuron} from "../../../models/neuron";

const wellStyleDanger = {
    borderColor: "red",
    backgroundColor: "#F2DEDE"
};

type SampleProps = {
    sample: ISample
}

export const SamplePreview = (props: SampleProps) => {
    if (!props.sample) {
        return null;
    }

    return (
        <Card fluid={true} style={props.sample.neurons.length === 0 ? wellStyleDanger : {}}>
            <Card.Content header={props.sample.tag || "( no tag)"}/>
            <Card.Content>
                <Neurons neurons={props.sample.neurons}/>
                <p/>
                <Injections injections={props.sample.injections}/>
                <h5>Animal</h5>
                {displaySampleAnimal(props.sample)}
                <h5>Comments</h5>
                {props.sample.comment || "(none)"}
            </Card.Content>
        </Card>
    );
}

type NeuronProps = {
    neurons: INeuron[];
}

const Neurons = (props: NeuronProps) => {
    let count = 0;

    if (props.neurons && props.neurons.length) {
        count = props.neurons.length;
    }

    return (
        <div>
            <Label>{count}<Label.Detail>{count == 1 ? "Neuron" : "Neurons"}</Label.Detail></Label>
        </div>
    )
};

type InjectionsProps = {
    injections: IInjection[];
}

const Injections = (props: InjectionsProps) => {
    let count = 0;

    if (props.injections && props.injections.length) {
        count = props.injections.length;
    }

    return (
        <div>
            <Label>{count}<Label.Detail>{count == 1 ? "Injection" : "Injections"}</Label.Detail></Label>
            <List bulleted>
                {props.injections.map(i => (<List.Item key={i.id} content={displayInjection(i)}/>))}
            </List>
        </div>
    )
};
