import React, {useContext, useEffect, useRef, useState} from "react";
import {Navigate} from "react-router-dom";
import {useMutation, useQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Badge, Button, Card, Center, Divider, Group, SimpleGrid, Table, Text} from "@mantine/core";
import {IconCheck, IconMessageCheck, IconX} from "@tabler/icons-react";
import dayjs from "dayjs";

import {PaginationHeader} from "../../common/PaginationHeader";
import {AccessRequestStatusFilter, AccessRequestStatusFilterOptions, FeedbackStatusFilterOptions} from "../../common/filters/AccessRequestStatusFilter";
import {GraphQLErrorAlert} from "../../common/GraphQLErrorAlert";
import {AppLoading} from "../../app/AppLoading";
import {errorNotification} from "../../common/NotificationHelper";
import {OptionalFilter} from "../../../viewmodel/candidateFilter";
import {useUser} from "../../../hooks/useUser";
import {UserPermissions} from "../../../graphql/user";
import {
    ACCESS_REQUESTS_QUERY,
    AccessRequestsQueryResponse,
    OPEN_REQUEST_COUNT_QUERY,
    AccessRequestsQueryVariables,
    UPDATE_ACCESS_REQUEST_STATUS_MUTATION,
    UpdateAccessRequestStatusResponse,
    UpdateAccessRequestStatusVariables
} from "../../../graphql/accessRequest";
import {AccessRequest, AccessRequestKind, AccessRequestStatus, accessRequestStatusColor, accessRequestStatusName} from "../../../models/accessRequest";
import {formatUser} from "../../../models/user";
import {AdminAccessRequestsSettings, AdminTabProps} from "../adminSettings";
import {useSettingsMirror} from "../../../hooks/useSettingsMirror";
import {useOffsetReset} from "../../../hooks/useOffsetReset";
import {NotificationContext} from "../../app/NotificationsApp";

type ReviewAction = {
    label: string;
    color: string;
    icon: React.ReactNode;
    status: AccessRequestStatus;
}

type RequestKindView = {
    kind: AccessRequestKind;
    title: string;
    noun: string;
    purposeHeader: string;
    reviewerHeader: string;
    createdHeader: string;
    statusOptions: AccessRequestStatus[];
    actions: ReviewAction[];
}

const AccessRequestView: RequestKindView = {
    kind: AccessRequestKind.Access,
    title: "Access Requests",
    noun: "requests",
    purposeHeader: "Purpose",
    reviewerHeader: "Reviewed By",
    createdHeader: "Requested",
    statusOptions: AccessRequestStatusFilterOptions,
    actions: [
        {label: "Accept", color: "teal", icon: <IconCheck size={18}/>, status: AccessRequestStatus.Accepted},
        {label: "Deny", color: "red", icon: <IconX size={18}/>, status: AccessRequestStatus.Denied}
    ]
};

const FeedbackView: RequestKindView = {
    kind: AccessRequestKind.Feedback,
    title: "Feedback & Messages",
    noun: "messages",
    purposeHeader: "Message",
    reviewerHeader: "Responded By",
    createdHeader: "Received",
    statusOptions: FeedbackStatusFilterOptions,
    actions: [
        {label: "Mark as Responded", color: "teal", icon: <IconMessageCheck size={18}/>, status: AccessRequestStatus.Accepted}
    ]
};

export const AccessRequests = (props: AdminTabProps<AdminAccessRequestsSettings>) => <RequestQueue view={AccessRequestView} {...props}/>;

export const Feedback = (props: AdminTabProps<AdminAccessRequestsSettings>) => <RequestQueue view={FeedbackView} {...props}/>;

type RequestQueueProps = AdminTabProps<AdminAccessRequestsSettings> & {
    view: RequestKindView;
}

const RequestQueue = observer(({view, settings, onSettingsChange}: RequestQueueProps) => {
    const user = useUser();

    if ((user?.permissions & UserPermissions.Admin) == 0) {
        return <Navigate to="/" replace/>;
    }

    const {offset, limit} = settings.pagination;

    const selectionId = settings.selectedId;

    const setOffset = (offset: number) => onSettingsChange(s => ({...s, pagination: {...s.pagination, offset}}));

    const setSelectionId = (selectedId: string) => onSettingsChange(s => ({...s, selectedId}));

    const [statusFilter] = useState(() => OptionalFilter.fromSettings(settings.filters.statuses));

    useSettingsMirror(() => statusFilter.settings, statuses => onSettingsChange(s => ({...s, filters: {...s.filters, statuses}})));

    const status = statusFilter.isEnabled ? statusFilter.contents : [];

    // The table does not poll on its own.  It follows the open count that drives this tab's badge, refetching whenever
    // that count changes, so the two cannot drift apart on separate timers.  Any arrival or status change of an open
    // request moves the count.  It is fetched fresh on mount, as a cached table may be older than the badge.
    const {data, previousData, loading, error, refetch} = useQuery<AccessRequestsQueryResponse, AccessRequestsQueryVariables>(ACCESS_REQUESTS_QUERY, {
        variables: {input: {offset: offset, limit: limit, status: status, requestKind: view.kind}},
        fetchPolicy: "cache-and-network"
    });

    const notifications = useContext(NotificationContext);

    const openCount = view.kind === AccessRequestKind.Feedback ? notifications.openFeedbackCount : notifications.openAccessRequestCount;

    const lastOpenCount = useRef(openCount);

    useEffect(() => {
        if (openCount !== lastOpenCount.current) {
            lastOpenCount.current = openCount;
            refetch();
        }
    }, [openCount]);

    const [updateStatus, {loading: updating}] = useMutation<UpdateAccessRequestStatusResponse, UpdateAccessRequestStatusVariables>(UPDATE_ACCESS_REQUEST_STATUS_MUTATION, {
        // The open counts behind the badges poll slowly, so they are refreshed with the table rather than lagging behind it.
        refetchQueries: [ACCESS_REQUESTS_QUERY, OPEN_REQUEST_COUNT_QUERY],
        awaitRefetchQueries: true,
        onCompleted: (data) => {
            if (!data.updateAccessRequestStatus) {
                errorNotification(view.title, "There was an unknown error updating the status.");
                return;
            }

            // The default filter only shows unreviewed requests, so a reviewed request typically leaves the table.
            setSelectionId(null);
        },
        onError: (e) => errorNotification(view.title, e.message)
    });

    useOffsetReset(offset, data?.accessRequests?.totalCount, () => setOffset(0));

    if (error) {
        return <GraphQLErrorAlert title={`${view.title} Could not be Loaded`} error={error}/>;
    }

    // Cached rows are shown while a fresh copy loads, falling back to the previous page while new variables load.
    const source = data ?? previousData;

    if (loading && !source) {
        return <AppLoading message={`loading ${view.title.toLowerCase()}...`}/>;
    }

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
            onSettingsChange(s => ({...s, pagination: {...s.pagination, limit: value}}));
        }
    };

    return (
        <Card withBorder>
            <Card.Section bg="segment">
                <Group p={12}>
                    <Text size="lg" fw={500}>{view.title}</Text>
                </Group>
                <Divider orientation="horizontal"/>
            </Card.Section>
            <Card.Section bg="segment">
                <Group p={8} justify="space-between">
                    <AccessRequestStatusFilter w={300} filter={statusFilter} allowedValues={view.statusOptions} kind={view.kind}/>
                    <Group>
                        {view.actions.map(a => (
                            <Button key={a.label} variant="light" color={a.color} leftSection={a.icon} disabled={!canReview} loading={updating}
                                    onClick={() => updateStatus({variables: {id: selected.id, status: a.status}})}>
                                {a.label}
                            </Button>
                        ))}
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
                    <AccessRequestTable view={view} requests={requests} selectionId={selectionId} onSelect={setSelectionId}/> :
                    <Center p={24}><Text c="dimmed">{`There are no matching ${view.noun}.`}</Text></Center>}
            </Card.Section>
            {requests.length > 0 ?
                <Card.Section bg="segment">
                    <SimpleGrid cols={2} p={8}>
                        <Text size="sm">
                            {`Showing ${start} to ${end} of ${totalCount} ${view.noun}`}
                        </Text>
                        <Text size="sm" ta="end">{`Page ${activePage} of ${pageCount}`}</Text>
                    </SimpleGrid>
                </Card.Section> : null}
        </Card>
    );
});

type AccessRequestTableProps = {
    view: RequestKindView;
    requests: AccessRequest[];
    selectionId: string;
    onSelect: (id: string) => void;
}

const AccessRequestTable = ({view, requests, selectionId, onSelect}: AccessRequestTableProps) => {
    const rows = requests.map(r => <AccessRequestRow key={r.id} request={r} selected={r.id === selectionId} onSelect={onSelect}/>);

    return (
        <Table>
            <Table.Thead>
                <Table.Tr bg="table-header">
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Contact</Table.Th>
                    <Table.Th>Affiliation</Table.Th>
                    <Table.Th>{view.purposeHeader}</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>{view.reviewerHeader}</Table.Th>
                    <Table.Th>{view.createdHeader}</Table.Th>
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
                <Badge variant="light" color={accessRequestStatusColor(request.status)}>{accessRequestStatusName(request.status, request.requestKind)}</Badge>
            </Table.Td>
            <Table.Td><Text size="sm" style={{whiteSpace: "nowrap"}}>{formatUser(request.admin, "-")}</Text></Table.Td>
            <Table.Td><Text size="sm" style={{whiteSpace: "nowrap"}}>{dayjs(request.createdAt).format("YYYY-MM-DD")}</Text></Table.Td>
            <Table.Td><Text size="sm" style={{whiteSpace: "nowrap"}}>{dayjs(request.updatedAt).format("YYYY-MM-DD")}</Text></Table.Td>
        </Table.Tr>
    );
}
