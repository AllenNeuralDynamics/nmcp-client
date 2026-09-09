import React, {useState} from "react";
import {Navigate} from "react-router-dom";
import {useMutation, useQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Badge, Button, Card, Center, Divider, Group, SimpleGrid, Table, Text} from "@mantine/core";
import {IconCheck, IconX} from "@tabler/icons-react";
import dayjs from "dayjs";

import {PaginationHeader} from "../../common/PaginationHeader";
import {AccessRequestStatusFilter} from "../../common/filters/AccessRequestStatusFilter";
import {GraphQLErrorAlert} from "../../common/GraphQLErrorAlert";
import {AppLoading} from "../../app/AppLoading";
import {errorNotification} from "../../common/NotificationHelper";
import {OptionalFilter} from "../../../viewmodel/candidateFilter";
import {useUser} from "../../../hooks/useUser";
import {UserPermissions} from "../../../graphql/user";
import {
    ACCESS_REQUESTS_QUERY,
    AccessRequestsQueryResponse,
    AccessRequestsQueryVariables,
    UPDATE_ACCESS_REQUEST_STATUS_MUTATION,
    UpdateAccessRequestStatusResponse,
    UpdateAccessRequestStatusVariables
} from "../../../graphql/accessRequest";
import {AccessRequest, AccessRequestStatus, accessRequestStatusColor, accessRequestStatusName} from "../../../models/accessRequest";
import {formatUser} from "../../../models/user";

export const AccessRequests = observer(() => {
    const user = useUser();

    if ((user?.permissions & UserPermissions.Admin) == 0) {
        return <Navigate to="/" replace/>;
    }

    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(10);

    const [selectionId, setSelectionId] = useState<string>(null);

    // Unreviewed requests are the ones that require action, so they are what is shown until the user asks for something else.
    const [statusFilter] = useState(new OptionalFilter<AccessRequestStatus[]>([AccessRequestStatus.Unreviewed], true));

    const status = statusFilter.isEnabled ? statusFilter.contents : [];

    const {data, previousData, loading, error} = useQuery<AccessRequestsQueryResponse, AccessRequestsQueryVariables>(ACCESS_REQUESTS_QUERY, {
        variables: {input: {offset: offset, limit: limit, status: status}},
        pollInterval: 10000
    });

    const [updateStatus, {loading: updating}] = useMutation<UpdateAccessRequestStatusResponse, UpdateAccessRequestStatusVariables>(UPDATE_ACCESS_REQUEST_STATUS_MUTATION, {
        refetchQueries: [ACCESS_REQUESTS_QUERY],
        awaitRefetchQueries: true,
        onCompleted: (data) => {
            if (!data.updateAccessRequestStatus) {
                errorNotification("Access Request", "There was an unknown error updating the status.");
                return;
            }

            // The default filter only shows unreviewed requests, so a reviewed request typically leaves the table.
            setSelectionId(null);
        },
        onError: (e) => errorNotification("Access Request", e.message)
    });

    if (error) {
        return <GraphQLErrorAlert title="Access Requests Could not be Loaded" error={error}/>;
    }

    if (loading && !previousData) {
        return <AppLoading message={"loading access requests..."}/>;
    }

    const source = loading ? previousData : data;

    const requests: AccessRequest[] = source?.accessRequests?.items ?? [];
    const totalCount = source?.accessRequests?.totalCount ?? 0;

    const pageCount = Math.max(Math.ceil(totalCount / limit), 1);

    const activePage = Math.min(offset ? (Math.floor(offset / limit) + 1) : 1, pageCount);

    const start = offset + 1;

    const end = Math.min(offset + limit, totalCount);

    const selected = selectionId ? requests.find(r => r.id === selectionId) : null;

    const canReview = selected?.status === AccessRequestStatus.Unreviewed;

    const onUpdateLimit = (value: number) => {
        if (value !== limit) {
            if (offset < value) {
                setOffset(0);
            }

            setLimit(value);
        }
    };

    return (
        <Card withBorder>
            <Card.Section bg="segment">
                <Group p={12}>
                    <Text size="lg" fw={500}>Access Requests</Text>
                </Group>
                <Divider orientation="horizontal"/>
            </Card.Section>
            <Card.Section bg="segment">
                <Group p={8} justify="space-between">
                    <AccessRequestStatusFilter w={300} filter={statusFilter}/>
                    <Group>
                        <Button variant="light" color="teal" leftSection={<IconCheck size={18}/>} disabled={!canReview} loading={updating}
                                onClick={() => updateStatus({variables: {id: selected.id, status: AccessRequestStatus.Accepted}})}>
                            Accept
                        </Button>
                        <Button variant="light" color="red" leftSection={<IconX size={18}/>} disabled={!canReview} loading={updating}
                                onClick={() => updateStatus({variables: {id: selected.id, status: AccessRequestStatus.Denied}})}>
                            Deny
                        </Button>
                    </Group>
                </Group>
                <Divider orientation="horizontal"/>
            </Card.Section>
            <Card.Section bg="segment">
                <PaginationHeader total={pageCount} value={activePage} limit={limit} itemCount={totalCount}
                                  onLimitChange={onUpdateLimit}
                                  onChange={p => setOffset((p - 1) * limit)}/>
            </Card.Section>
            <Card.Section>
                {requests.length > 0 ?
                    <AccessRequestTable requests={requests} selectionId={selectionId} onSelect={setSelectionId}/> :
                    <Center p={24}><Text c="dimmed">There are no matching access requests.</Text></Center>}
            </Card.Section>
            {requests.length > 0 ?
                <Card.Section bg="segment">
                    <SimpleGrid cols={2} p={8}>
                        <Text size="sm">
                            {`Showing ${start} to ${end} of ${totalCount} requests`}
                        </Text>
                        <Text size="sm" ta="end">{`Page ${activePage} of ${pageCount}`}</Text>
                    </SimpleGrid>
                </Card.Section> : null}
        </Card>
    );
});

const AccessRequestTable = ({requests, selectionId, onSelect}: { requests: AccessRequest[], selectionId: string, onSelect: (id: string) => void }) => {
    const rows = requests.map(r => <AccessRequestRow key={r.id} request={r} selected={r.id === selectionId} onSelect={onSelect}/>);

    return (
        <Table>
            <Table.Thead>
                <Table.Tr bg="table-header">
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Contact</Table.Th>
                    <Table.Th>Affiliation</Table.Th>
                    <Table.Th>Purpose</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Reviewed By</Table.Th>
                    <Table.Th>Requested</Table.Th>
                    <Table.Th>Updated</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody bg="table">
                {rows}
            </Table.Tbody>
        </Table>
    );
}

const AccessRequestRow = ({request, selected, onSelect}: { request: AccessRequest, selected: boolean, onSelect: (id: string) => void }) => {
    const subProps = selected ? {bg: "table-selection"} : {};

    return (
        <Table.Tr key={request.id} {...subProps} onClick={() => onSelect(request.id)}>
            <Table.Td><Text size="sm" style={{whiteSpace: "nowrap"}}>{request.firstName} {request.lastName}</Text></Table.Td>
            <Table.Td>{request.emailAddress}</Table.Td>
            <Table.Td>{request.affiliation}</Table.Td>
            <Table.Td>{request.purpose}</Table.Td>
            <Table.Td>
                <Badge variant="light" color={accessRequestStatusColor(request.status)}>{accessRequestStatusName(request.status)}</Badge>
            </Table.Td>
            <Table.Td><Text size="sm" style={{whiteSpace: "nowrap"}}>{formatUser(request.admin, "-")}</Text></Table.Td>
            <Table.Td><Text size="sm" style={{whiteSpace: "nowrap"}}>{dayjs(request.createdAt).format("YYYY-MM-DD")}</Text></Table.Td>
            <Table.Td><Text size="sm" style={{whiteSpace: "nowrap"}}>{dayjs(request.updatedAt).format("YYYY-MM-DD")}</Text></Table.Td>
        </Table.Tr>
    );
}
