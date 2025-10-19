import * as React from "react";
import {Link} from "react-router-dom";
import {Group, Text} from "@mantine/core";

import {formatNeuron, NeuronShape} from "../../models/neuron";

export const NeuronVersionLink = ({neuron}: { neuron: NeuronShape }) => {
    return (
        <Group>
            <Link style={{color: "var(--mantine-color-text)"}} to={`/neuron/${neuron?.id}`}>
                <Text size="sm" td="underline">
                    {formatNeuron(neuron)}
                </Text>
            </Link>
        </Group>
    );
}
