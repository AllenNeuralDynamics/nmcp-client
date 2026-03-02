import * as React from "react";
import {useQuery} from "@apollo/client";
import {Badge, Card, Center, Flex, Loader, SimpleGrid, Stack, Table, Text} from "@mantine/core";

import {QualityOutput, QualityControlTest} from "../../models/qualityControl";
import {QualityControlStatus, qualityControlColor, qualityControlStatus} from "../../models/qualityControlStatus";
import {
    NEURON_QUALITY_CONTROL_QUERY,
    NeuronQualityControlResponse,
    NeuronQualityControlVariables,
} from "../../graphql/qualityControl";

type QualityMetricsProps = {
    neuronId: string;
}

export const QualityMetrics = ({neuronId}: QualityMetricsProps) => {
    const {data, loading} = useQuery<NeuronQualityControlResponse, NeuronQualityControlVariables>(NEURON_QUALITY_CONTROL_QUERY, {
        variables: {neuronId}
    });

    const qc = data?.neuron?.published?.qualityControl;

    if (loading) {
        return (
            <Flex p={24} justify="center">
                <Loader size="sm"/>
            </Flex>
        );
    }

    if (!qc) {
        return (
            <Flex p={24}>
                <Text size="sm" c="dimmed">Quality control has not been created for this neuron.</Text>
            </Flex>
        );
    }

    return (
        <Stack p={12} gap="md">
            <Badge color={qualityControlColor(qc.status)} variant="light" size="lg">
                {qualityControlStatus(qc.status)}
            </Badge>
            {qc.current ? <CurrentResult output={qc.current}/> : null}
            {qc.history?.length > 0 ? (
                <Text size="sm" c="dimmed">{qc.history.length} prior {qc.history.length === 1 ? "result" : "results"} available</Text>
            ) : null}
        </Stack>
    );
};

const CurrentResult = ({output}: { output: QualityOutput }) => {
    const hasErrors = output.errors?.length > 0;
    const hasWarnings = output.warnings?.length > 0;

    return (
        <Stack gap="md">
            <Text size="sm" c="dimmed">Tool version: {output.toolVersion}</Text>
            {output.toolError ? (
                <Card withBorder>
                    <Card.Section bg="red.4" p={8}>
                        <Text fw={500}>Tool Error: {output.toolError.kind}</Text>
                    </Card.Section>
                    <Card.Section p={12}>
                        <Stack gap="xs">
                            <Text size="sm">{output.toolError.description}</Text>
                            {output.toolError.info ? <Text size="xs" c="dimmed">{output.toolError.info}</Text> : null}
                        </Stack>
                    </Card.Section>
                </Card>
            ) : null}
            {hasErrors || hasWarnings ? (
                <SimpleGrid cols={2}>
                    <IssuesSection issues={output.errors} kind="error"/>
                    <IssuesSection issues={output.warnings} kind="warning"/>
                </SimpleGrid>
            ) : (
                <Text size="sm">No errors or warnings.</Text>
            )}
        </Stack>
    );
};

const IssuesSection = ({issues, kind}: { issues: QualityControlTest[], kind: "error" | "warning" }) => {
    const isError = kind === "error";

    if (!issues || issues.length === 0) {
        return (
            <Card withBorder>
                <Card.Section bg={isError ? "red.4" : "yellow.2"} p={8}>
                    <Text fw={500}>{isError ? "Errors" : "Warnings"}</Text>
                </Card.Section>
                <Center p={16}>
                    <Badge variant="light" color="green">No {isError ? "Errors" : "Warnings"}</Badge>
                </Center>
            </Card>
        );
    }

    return (
        <Card withBorder>
            <Card.Section bg={isError ? "red.4" : "yellow.2"} p={8}>
                <Text fw={500}>{isError ? "Errors" : "Warnings"}</Text>
            </Card.Section>
            <Card.Section>
                <Table>
                    <Table.Thead bg="table-header">
                        <Table.Tr>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Description</Table.Th>
                            <Table.Th>Affected Nodes</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody bg="table">
                        {issues.map((issue, idx) => (
                            <Table.Tr key={idx}>
                                <Table.Td>{issue.name}</Table.Td>
                                <Table.Td>{issue.description}</Table.Td>
                                <Table.Td>{issue.nodes.length}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Card.Section>
        </Card>
    );
};
