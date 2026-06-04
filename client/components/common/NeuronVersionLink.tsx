import * as React from "react";
import {Link} from "react-router-dom";
import {Group, Text} from "@mantine/core";

import {formatNeuron, NeuronShape} from "../../models/neuron";

export type NeuronLinkState = {
    focusOnSoma?: boolean;
};

export const NeuronVersionLink = ({neuron, focusOnSoma = false}: { neuron: NeuronShape; focusOnSoma?: boolean }) => {
    const state: NeuronLinkState | undefined = focusOnSoma ? {focusOnSoma: true} : undefined;

    return (
        <Group>
            <Link style={{color: "var(--mantine-color-text)"}} to={`/neuron/${neuron?.id}`} state={state}>
                <Text size="sm" td="underline">
                    {formatNeuron(neuron)}
                </Text>
            </Link>
        </Group>
    );
}
