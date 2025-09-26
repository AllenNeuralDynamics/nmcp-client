import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Box, Button, Card, Center, Chip, Group, Loader, SimpleGrid, Stack, Table, Text, Title} from "@mantine/core";
import {IconRefreshDot} from "@tabler/icons-react";

import {IReconstruction} from "../../models/reconstruction";
import {QUALITY_CHECK_MUTATION, QualityCheckResponse, QualityCheckVariables} from "../../graphql/reconstruction";
import {QualityCheckStatus} from "../../models/qualityCheckStatus";
import {QualityCheckError} from "../../models/qualityCheck";
import moment from "moment";

export type QualityCheckProps = {
    reconstruction: IReconstruction;
}

function messageForStatus(qualityStatus: QualityCheckStatus, when: Date = null): string {
    if (qualityStatus == QualityCheckStatus.InProgress) {
        return "Quality check requested";
    } else if (when) {
        return `Last performed ${moment(when).toLocaleString()}`;
    }

    return "Quality check not requested";
}

export const QualityCheck: React.FC<QualityCheckProps> = ({reconstruction = null}) => {
    const [qualityStatus, setQualityStatus] = useState<QualityCheckStatus>(reconstruction.qualityCheckStatus);
    const [message, setMessage] = useState<string>(messageForStatus(qualityStatus, reconstruction.qualityCheckAt));

    const [qualityCheck, {data: qualityCheckData}] = useMutation<QualityCheckResponse, QualityCheckVariables>(QUALITY_CHECK_MUTATION,
        {
            refetchQueries: ["ReviewableReconstructions"],
            optimisticResponse: {
                requestQualityCheck: {
                    id: reconstruction.id,
                    // @ts-ignore
                    __typename: "Reconstruction",
                    qualityCheckStatus: QualityCheckStatus.InProgress,
                    error: null
                }
            },
            onCompleted: (data) => {
                setQualityStatus(data.requestQualityCheck.qualityCheckStatus);
                setMessage(messageForStatus(data.requestQualityCheck.qualityCheckStatus, data.requestQualityCheck.qualityCheckAt))
            }
        });

    let qualityControlButton = null;

    if (qualityStatus != QualityCheckStatus.Complete) {
        qualityControlButton = (<Button leftSection={<IconRefreshDot/>} color="yellow" disabled={qualityStatus == QualityCheckStatus.InProgress}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            setQualityStatus(QualityCheckStatus.InProgress);
                                            setMessage(messageForStatus(QualityCheckStatus.InProgress))
                                            await qualityCheck({variables: {id: reconstruction.id}});
                                        }}>Request Again</Button>);
    }

    const issueCount = reconstruction.qualityCheck.warnings.length + reconstruction.qualityCheck.errors.length;

    return (
        <Card shadow="md" radius="sm" withBorder={true}>
            <Card.Section bg="segment.9">
                <div style={{display: "flex", flexDirection: "row", margin: "12px 20px 12px 20px"}}>
                    <Text size="xl" fw={500} style={{margin: 0, marginTop: "6px", verticalAlign: "middle"}}>Quality Check</Text>
                    <div style={{order: 2, flexGrow: 1, flexShrink: 1}}/>
                    <div style={{order: 3, flexGrow: 0, flexShrink: 0, marginRight: "12px"}}>
                        <Group>
                            <Text size="xs">{message}</Text>
                            {qualityStatus == QualityCheckStatus.InProgress ? <Loader size="xs" color="blue"/> : null}
                            {qualityControlButton}
                        </Group>
                    </div>
                </div>
            </Card.Section>
            <div style={{margin: "12px 8px 0px 0px"}}>
                {issueCount > 0 ? <IssuesGrid reconstruction={reconstruction}/> : NoIssues}
            </div>
        </Card>
    );
}

enum QualityIssueType {
    Warning,
    Error
}

const NoIssues = <Chip defaultChecked color="green">No Errors or Warnings</Chip>
const NoErrors = <Center><Chip m={16} defaultChecked color="green">No Errors</Chip></Center>
const NoWarnings = <Center><Chip m={16} defaultChecked color="green">No Warnings</Chip></Center>

const IssuesGrid: React.FC<QualityCheckProps> = ({reconstruction}) => {
    const errorTable = <IssuesSection issues={reconstruction.qualityCheck.errors} kind={QualityIssueType.Error}/>
    const warningTable = <IssuesSection issues={reconstruction.qualityCheck.warnings} kind={QualityIssueType.Warning}/>

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

const IssuesSection: React.FC<IssuesTableProps> = ({issues, kind}) => {
    return (
        <Stack gap={0}>
            <Box style={{border: "1px solid #ddd"}} bg={kind == QualityIssueType.Error ? "Red" : "Orange"} p={8}>
                <Title order={6} style={{color: "white"}}>{kind == QualityIssueType.Error ? "Errors" : "Warnings"}</Title>
            </Box>
            <Box style={{borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd"}}>
                {issues.length == 0 ? (kind == QualityIssueType.Error ? NoErrors : NoWarnings) : <IssuesTable issues={issues}/>}
            </Box>
        </Stack>
    );
}

const IssuesTable: React.FC<IssuesTableProps> = ({issues}) => {
    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Affected Nodes</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
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
