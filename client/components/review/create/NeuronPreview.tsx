import * as React from "react";
import {Card, Header} from "semantic-ui-react";

import {INeuron} from "../../../models/neuron";
import {formatNodeCoordinates} from "../../../models/swcNode";
import {displayBrainArea} from "../../../models/brainArea";

interface INeuronProps {
    neuron: INeuron
}

export const NeuronPreview = (props: INeuronProps) => {
    if (!props.neuron) {
        return null;
    }

    return (
        <Card fluid={true}>
            <Card.Content header={props.neuron.tag || "(none)"}/>
            <Card.Content>
                <Header as="h5" content="Soma"/>
                {displayBrainArea(props.neuron.brainArea, "(brain structure not defined)")}
                <p/>
                {formatNodeCoordinates(props.neuron.x, props.neuron.y, props.neuron.z)}
            </Card.Content>
        </Card>
    );
};
