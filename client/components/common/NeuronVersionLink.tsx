import * as React from "react";
import {Link} from "react-router-dom";
import {Group, Text} from "@mantine/core";

import {formatNeuron, NeuronShape} from "../../models/neuron";

export type NeuronLinkState = {
    openAtlasTab?: boolean;
};

export const NeuronVersionLink = ({neuron, openAtlasTab = false}: { neuron: NeuronShape; openAtlasTab?: boolean }) => {
    const state: NeuronLinkState | undefined = openAtlasTab ? {openAtlasTab: true} : undefined;

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
