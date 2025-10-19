import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Box, Button, Card, Center, Chip, Divider, Group, Loader, SimpleGrid, Stack, Table, Text, Title} from "@mantine/core";
import {IconRefreshDot} from "@tabler/icons-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";

import {AtlasReconstruction} from "../../models/atlasReconstruction";
import {QUALITY_CHECK_MUTATION, QualityCheckResponse, QualityCheckVariables} from "../../graphql/atlasReconstruction";
import {QualityControlStatus} from "../../models/qualityControlStatus";
import {QualityCheckError} from "../../models/qualityControl";

dayjs.extend(utc);
dayjs.extend(localizedFormat);

export type QualityCheckProps = {
    reconstruction: AtlasReconstruction;
}

function messageForStatus(qualityStatus: QualityControlStatus, when: Date = null): string {
    if (qualityStatus == QualityControlStatus.Pending) {
        return "Quality check requested";
    } else if (when) {
        return `Last performed ${dayjs(when).local().format("L LT")}`;
    }

    return "Quality check not requested";
}

export const QualityCheck: React.FC<QualityCheckProps> = ({reconstruction = null}) => {
    const [qualityStatus, setQualityStatus] = useState<QualityControlStatus>(reconstruction.qualityCheckStatus);
    const [message, setMessage] = useState<string>(messageForStatus(qualityStatus, reconstruction.qualityCheckAt));

    const [qualityCheck] = useMutation<QualityCheckResponse, QualityCheckVariables>(QUALITY_CHECK_MUTATION,
        {
            refetchQueries: ["ReviewableReconstructions"],
            optimisticResponse: {
                requestQualityCheck: {
                    id: reconstruction.id,
                    // @ts-ignore
                    __typename: "Reconstruction",
                    qualityCheckStatus: QualityControlStatus.Pending,
                    error: null
                }
            },
            onCompleted: (data) => {
                setQualityStatus(data.requestQualityCheck.qualityCheckStatus);
                setMessage(messageForStatus(data.requestQualityCheck.qualityCheckStatus, data.requestQualityCheck.qualityCheckAt))
            },
            onError: (e) => console.log(e)
        });

    let qualityControlButton = null;

    if (qualityStatus != QualityControlStatus.Passed) {
        qualityControlButton = (<Button size="xs" color="yellow" disabled={qualityStatus == QualityControlStatus.Pending} leftSection={<IconRefreshDot/>}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            setQualityStatus(QualityControlStatus.Pending);
                                            setMessage(messageForStatus(QualityControlStatus.Pending))
                                            await qualityCheck({variables: {id: reconstruction.id}});
                                        }}>Request Again</Button>);
    }

    const issueCount = reconstruction.qualityCheck.warnings.length + reconstruction.qualityCheck.errors.length;

    return (
        <Card withBorder>
            <Card.Section bg="segment" p={12}>
                <Group justify="space-between" align="center">
                    <Text size="lg" fw={500}>Quality Check</Text>
                    <Group>
                        <Text size="xs">{message}</Text>
                        {qualityStatus == QualityControlStatus.Pending ? <Loader size="xs" color="blue"/> : null}
                        {qualityControlButton}
                    </Group>
                </Group>
            </Card.Section>
            <Card.Section>
                <Divider orientation="horizontal"/>
            </Card.Section>
            <div style={{marginTop: "12px"}}>
                {issueCount > 0 ? <IssuesGrid reconstruction={reconstruction}/> : NoIssues}
            </div>
        </Card>
    );
}

enum QualityIssueType {
    Warning,
    Error
}

const NoIssues = <Chip variant="light" size="sm" defaultChecked color="green">No Errors or Warnings</Chip>
const NoErrors = <Center><Chip variant="light" m={16} defaultChecked color="green">No Errors</Chip></Center>
const NoWarnings = <Center><Chip variant="light" m={16} defaultChecked color="green">No Warnings</Chip></Center>

const IssuesGrid = ({reconstruction}: QualityCheckProps) => {
    const errorTable = reconstruction.qualityCheck.errors.length > 0 ?
        <IssuesSection issues={reconstruction.qualityCheck.errors} kind={QualityIssueType.Error}/> : NoErrors;
    const warningTable = reconstruction.qualityCheck.warnings.length > 0 ?
        <IssuesSection issues={reconstruction.qualityCheck.warnings} kind={QualityIssueType.Warning}/> : NoWarnings;

    return (
        <SimpleGrid cols={2}>
            {[errorTable, warningTable]}
        </SimpleGrid>
    );
}

export type IssuesTableProps = {
    kind?: QualityIssueType;
    issues: QualityCheckError[];
}

const IssuesSection = ({issues, kind}: IssuesTableProps) => {
    return (
        <Card withBorder>
            <Card.Section bg={kind == QualityIssueType.Error ? "red.4" : "yellow.2"} p={8}>
                <Text fw={500}>{kind == QualityIssueType.Error ? "Errors" : "Warnings"}</Text>
            </Card.Section>
            <Card.Section>
                <IssuesTable issues={issues}/>
            </Card.Section>
        </Card>
    );
}

const IssuesTable = ({issues}: IssuesTableProps) => {
    return (
        <Table>
            <Table.Thead bg="table-header">
                <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Affected Nodes</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody bg="table">
                {issues.map((issue: QualityCheckError, idx: number) => (
                    <Table.Tr key={idx}>
                        <Table.Td>
                            {issue.testName}
                        </Table.Td>
                        <Table.Td>
                            {issue.testDescription}
                        </Table.Td>
                        <Table.Td>
                            {issue.affectedNodes.length}
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
}
