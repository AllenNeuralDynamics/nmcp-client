import * as React from "react";
import {useMutation, useQuery} from "@apollo/client";
import {Badge, Button, Card, Center, Flex, Group, Loader, SimpleGrid, Stack, Table, Text} from "@mantine/core";
import {IconRefresh} from "@tabler/icons-react";

import {Reconstruction} from "../../../models/reconstruction";
import {ReconstructionStatus} from "../../../models/reconstructionStatus";
import {QualityOutput, QualityControlTest} from "../../../models/qualityControl";
import {QualityControlStatus, qualityControlColor, qualityControlStatus} from "../../../models/qualityControlStatus";
import {
    QUALITY_CONTROL_DETAIL_QUERY, QualityControlDetailResponse, QualityControlDetailVariables,
    REASSESS_QUALITY_CONTROL_MUTATION, ReassessQualityControlResponse, ReassessQualityControlVariables
} from "../../../graphql/qualityControl";

export type QualityCheckProps = {
    reconstruction: Reconstruction;
    isActive: boolean;
}

export const QualityCheck = ({reconstruction, isActive}: QualityCheckProps) => {
    const qcId = reconstruction.atlasReconstruction?.qualityControl?.id;

    const {data, loading, refetch} = useQuery<QualityControlDetailResponse, QualityControlDetailVariables>(QUALITY_CONTROL_DETAIL_QUERY, {
        variables: {id: qcId},
        skip: !isActive || !qcId
    });

    const [reassess, {loading: reassessing}] = useMutation<ReassessQualityControlResponse, ReassessQualityControlVariables>(REASSESS_QUALITY_CONTROL_MUTATION, {
        variables: {reconstructionId: reconstruction.id},
        refetchQueries: ["ReviewableReconstructions"],
        onCompleted: () => refetch()
    });

    if (!qcId) {
        return (
            <Flex p={24}>
                <Text size="sm" c="dimmed">Quality control has not been created for this reconstruction.</Text>
            </Flex>
        );
    }

    const qc = data?.qualityControl;
    const qcStatus = qc?.status;

    const isPending = qcStatus === QualityControlStatus.Pending;
    const isTerminal = reconstruction.status === ReconstructionStatus.Published || reconstruction.status === ReconstructionStatus.Archived;

    return (
        <Stack p={12} gap="md">
            <Group justify="space-between">
                <Group>
                    <Badge color={qualityControlColor(qcStatus)} variant="light" size="md">
                        {qualityControlStatus(qcStatus)}
                    </Badge>
                    {loading ? <Loader size="xs"/> : null}
                </Group>
                <Button size="xs" leftSection={<IconRefresh size={16}/>} disabled={isPending || reassessing || isTerminal}
                        loading={reassessing} onClick={() => reassess()}>
                    Assess Again
                </Button>
            </Group>
            {qc?.current ? <CurrentResult output={qc.current}/> : null}
            {qc?.history?.length > 0 ? (
                <Text size="sm" c="dimmed">{qc.history.length} prior {qc.history.length === 1 ? "result" : "results"} available</Text>
            ) : null}
        </Stack>
    );
}

const CurrentResult = ({output}: {output: QualityOutput}) => {
    const hasErrors = output.errors?.length > 0;
    const hasWarnings = output.warnings?.length > 0;
    const hasPassed = output.passed?.length > 0;

    return (
        <Stack gap="md">
            <Group gap="xs">
                <Text size="sm" c="dimmed">Tool version: {output.toolVersion}</Text>
            </Group>
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
            {hasErrors || hasWarnings || hasPassed ? (
                <SimpleGrid cols={(hasErrors || hasWarnings ? 2 : 0) + (hasPassed ? 1 : 0)}>
                    {hasErrors || hasWarnings ? <IssuesSection issues={output.errors} kind="error"/> : null}
                    {hasErrors || hasWarnings ? <IssuesSection issues={output.warnings} kind="warning"/> : null}
                    {hasPassed ? <PassedSection tests={output.passed}/> : null}
                </SimpleGrid>
            ) : (
                <Text size="sm">No errors or warnings.</Text>
            )}
        </Stack>
    );
}

const IssuesSection = ({issues, kind}: {issues: QualityControlTest[], kind: "error" | "warning"}) => {
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
}

const PassedSection = ({tests}: {tests: QualityControlTest[]}) => {
    return (
        <Card withBorder>
            <Card.Section bg="green.4" p={8}>
                <Text fw={500}>Passed</Text>
            </Card.Section>
            <Card.Section p={12}>
                <Stack gap={4}>
                    {tests.map((test, idx) => (
                        <Text key={idx} size="sm">{test.name}</Text>
                    ))}
                </Stack>
            </Card.Section>
        </Card>
    );
}
