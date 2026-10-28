import * as React from "react";
import {Link} from "react-router-dom";
import {Group, Text, Tooltip} from "@mantine/core";
import {IconShare3} from "@tabler/icons-react";

import {formatNeuron, NeuronShape} from "../../models/neuron";

export type NeuronLinkState = {
    openAtlasTab?: boolean;
};

// Router state does not survive into a new tab, so a link opened there asks for the atlas tab through the URL instead.
export const OpenAtlasTabSearchParam = "openAtlasTab";

export const NeuronVersionLink = ({neuron, openAtlasTab = false, newTabLink = false}: {
    neuron: NeuronShape;
    openAtlasTab?: boolean;
    newTabLink?: boolean
}) => {
    const path = `/neuron/${neuron?.id}`;

    const label = formatNeuron(neuron);

    const newTabLabel = `Open ${label} in a new tab`;

    const state: NeuronLinkState | undefined = openAtlasTab ? {openAtlasTab: true} : undefined;

    return (
        <Group gap="xs" wrap="nowrap">
            {newTabLink ?
                <Tooltip label={newTabLabel}>
                    {/* Kept from reaching enclosing click handlers, such as a table row that selects on click. */}
                    <Link to={openAtlasTab ? `${path}?${OpenAtlasTabSearchParam}=true` : path} target="_blank" rel="noopener noreferrer"
                          aria-label={newTabLabel} onClick={e => e.stopPropagation()}>
                        <IconShare3 size={16} style={{display: "block"}}/>
                    </Link>
                </Tooltip> : null}
            <Link style={{color: "var(--mantine-color-text)"}} to={path} state={state}>
                <Text size="sm" td="underline">
                    {label}
                </Text>
            </Link>
        </Group>
    );
}
