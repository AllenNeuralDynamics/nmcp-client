import React, {useState} from "react";
import {useQuery} from "@apollo/client";
import {Navigate} from "react-router-dom";
import {Card, Center, Divider, Group, Stack, Table, Text} from "@mantine/core";
import {IconCheck} from "@tabler/icons-react";
import dayjs from "dayjs";

import {IssueQueryResponse, OPEN_ISSUES_QUERY} from "../../../graphql/issue";
import {IssueShape, issueKindString, issueStatusName} from "../../../models/issue";
import {GraphQLErrorAlert} from "../../common/GraphQLErrorAlert";
import {UserPermissions} from "../../../graphql/user";
import {useUser} from "../../../hooks/useUser";
import {IssueActions} from "./IssueActions";
import {AppLoading} from "../../app/AppLoading";

export const Issues = () => {
    const user = useUser();

    if ((user?.permissions & UserPermissions.Admin) == 0) {
        return <Navigate to="/" replace/>;
    }

    const [selectionId, setSelectionId] = useState<string>(null);

    const {data, previousData, loading, error} = useQuery<IssueQueryResponse>(OPEN_ISSUES_QUERY, {
        pollInterval: 10000
    });

    if (error) {
        return <GraphQLErrorAlert title="Issue Data Could not be Loaded" error={error}/>;
    }

    let issues: IssueShape[] = [];

    if (loading && !previousData) {
        return <AppLoading message={"loading issues..."}/>;
    }

    if (loading) {
        issues = previousData?.openIssues ?? [];
    } else {
        issues = data.openIssues ?? [];
    }

    if (issues.length == 0) {
        return <NoIssues/>;
    }

    const selected = selectionId ? issues.find(i => i.id === selectionId) : null;

    const rows = issues.map(r => <IssueRow issue={r}  selected={r.id == selectionId} onSelect={setSelectionId}/>);

    return (
        <Card withBorder>
            <Card.Section bg="segment">
                <Group p={12}>
                    <Text size="lg" fw={500}>Open Issues</Text>
                </Group>
                <Divider orientation="horizontal"/>
            </Card.Section>
            <Card.Section bg="segment">
                <IssueActions issue={selected}/>
            </Card.Section>
            <Card.Section>
                <Table withColumnBorders>
                    <Table.Thead bg="table-header">
                        <Table.Tr>
                            <Table.Th>Id</Table.Th>
                            <Table.Th>Specimen</Table.Th>
                            <Table.Th>Neuron</Table.Th>
                            <Table.Th>Kind</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Description</Table.Th>
                            <Table.Th>Reported By</Table.Th>
                            <Table.Th>Reported</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows}
                    </Table.Tbody>
                </Table>
            </Card.Section>
        </Card>
    );
};

const IssueRow = ({issue, selected, onSelect}: { issue: IssueShape, selected: boolean, onSelect: (id: string) => void }) => {
    const subProps = selected ? {bg: "table-selection"} : {};

    return (
        <Table.Tr key={issue.id} {...subProps} onClick={() => onSelect(issue.id)}>
            <Table.Td><Text size="sm" fw={500}>{issue.issueId}</Text></Table.Td>
            <Table.Td>{issue.neuron?.specimen?.label ?? "(none)"}</Table.Td>
            <Table.Td>{issue.neuron?.label ?? "(none)"}</Table.Td>
            <Table.Td>{issueKindString(issue.kind)}</Table.Td>
            <Table.Td><Text size="sm" style={{whiteSpace: 'nowrap'}}>{issueStatusName(issue.status)}</Text></Table.Td>
            <Table.Td>{issue.description}</Table.Td>
            <Table.Td>
                {issue.author.firstName} {issue.author.lastName}
                <br/>
                <small>{issue.author.emailAddress}</small>
            </Table.Td>
            <Table.Td><Text size="sm" style={{whiteSpace: 'nowrap'}}>{dayjs(issue.createdAt).format("YYYY-MM-DD")}</Text></Table.Td>
        </Table.Tr>
    );
}

const NoIssues = () => {
    return (
        <Card withBorder>
            <Card.Section bg="segment">
                <Group p={12}>
                    <Text size="lg" fw={500}>Open Issues</Text>
                </Group>
                <Divider orientation="horizontal"/>
            </Card.Section>
            <Card.Section>
                <Center p={12}>
                    <Group>
                        <IconCheck color="green" size={32}/>
                        <Text size="lg" fw={500} c="dimmed">There are no open issues</Text>
                    </Group>
                </Center>
            </Card.Section>
        </Card>
    );
}
