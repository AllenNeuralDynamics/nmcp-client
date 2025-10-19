import * as React from "react";
import {Badge, Card, Center, Group, Loader, Text} from "@mantine/core";
import dayjs from "dayjs";

import {NeuronShape} from "../../../models/neuron";

type OverViewProps = {
    neuron: NeuronShape;
}

export const Overview = ({neuron}: OverViewProps) => {
    let content: React.JSX.Element;

    if (!neuron) {
        content = <Center mt={16}><Loader type="dots" size="sm"/></Center>;
    } else {
        content = (
            <>
                <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500} c="blue" size="lg">{neuron?.label}</Text>
                    <Badge color="green">Specimen {neuron?.specimen.label || "..."}</Badge>
                </Group>
                <Text
                    c="dimmed">{neuron.published ? `Published ${dayjs(neuron.published.searchIndexedAt).format("YYYY-MM-DD")}` : "Unpublished"}
                </Text>
            </>
        );
    }

    return (
        <Card miw={300} padding="lg" radius="md" withBorder>
            <Card.Section mih={180} bg="dark">
            </Card.Section>
            {content}
        </Card>
    );
}
