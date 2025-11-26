import React, {useCallback, useState} from "react";
import {Navigate} from "react-router-dom";
import {useMutation, useQuery} from "@apollo/client";

import {PaginationHeader} from "../../common/PaginationHeader";
import {User} from "../../../models/user";
import {
    UPDATE_PERMISSIONS_MUTATION,
    UpdatePermissionsResponse,
    UpdatePermissionsVariables,
    UserPermissions,
    UserQueryVariables,
    USERS_QUERY,
    UsersQueryResponse
} from "../../../graphql/user";
import {GraphQLErrorAlert} from "../../common/GraphQLErrorAlert";
import {useUser} from "../../../hooks/useUser";
import {AppLoading} from "../../app/AppLoading";
import {PermissionsCheckBox} from "./PermissionsCheckBox";
import {Badge, Card, Divider, Group, SimpleGrid, Switch, Table, Text} from "@mantine/core";


export const Users = () => {
    const user = useUser();

    if ((user?.permissions & UserPermissions.Admin) == 0) {
        return <Navigate to="/" replace/>;
    }

    const [state, setState] = useState({
        offset: 0,
        limit: 10,
        includeImported: false
    });

    const {loading, error, data, previousData} = useQuery<UsersQueryResponse, UserQueryVariables>(USERS_QUERY, {
        variables: {input: {offset: state.offset, limit: state.limit, includeImported: state.includeImported}},
        pollInterval: 10000
    });

    if (error) {
        return <GraphQLErrorAlert title="Users Could not be Loaded" error={error}/>;
    }

    if (loading && !previousData) {
        return <AppLoading message={"loading users..."}/>;
    }

    let source = loading ? previousData : data;

    const users: User[] = source.users.items ?? [];
    const totalCount = source.users.totalCount ?? 0;

    const onUpdateOffsetForPage = (page: number) => {
        const offset = state.limit * (page - 1);

        if (offset !== state.offset) {
            setState({...state, offset});
        }
    };

    const onUpdateLimit = (limit: number) => {
        if (limit !== state.limit) {
            let offset = state.offset;

            if (offset < limit) {
                offset = 0;
            }

            setState({...state, offset, limit});
        }
    };

    const pageCount = Math.max(Math.ceil(totalCount / state.limit), 1);

    const activePage = state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1;

    const start = state.offset + 1;

    const end = Math.min(state.offset + state.limit, totalCount);

    return (
        <Card withBorder>
            <Card.Section bg="segment">
                <Group p={12}>
                    <Text size="lg" fw={500}>Users</Text>
                </Group>
                <Divider orientation="horizontal"/>
            </Card.Section>
            <Card.Section bg="segment">
                <Group p={8}>
                    <Switch label="Include imported" checked={state.includeImported}
                            onChange={evt => setState({...state, includeImported: evt.currentTarget.checked})}/>
                </Group>
            </Card.Section>
            <Card.Section bg="segment">
                <PaginationHeader total={pageCount} value={activePage} limit={state.limit} itemCount={totalCount} onLimitChange={onUpdateLimit}
                                  onChange={onUpdateOffsetForPage}/>
            </Card.Section>
            <Card.Section>
                <UserTable adminUserId={user} users={users} includesImported={state.includeImported}/>
            </Card.Section>
            <Card.Section bg="segment">
                <SimpleGrid cols={2} p={8}>
                    <Text size="sm">
                        {`Showing ${start} to ${end} of ${totalCount} users`}
                    </Text>
                    <Text size="sm" ta="end">{`Page ${activePage} of ${pageCount}`}</Text>
                </SimpleGrid>
            </Card.Section>
        </Card>
    );
}
const UserTable = ({adminUserId, users, includesImported}: { adminUserId: User, users: User[], includesImported: boolean }) => {
    const rows = users.map((t: User) => {
        return <UserRow user={t} adminUserId={adminUserId.id} includesImported={includesImported}/>
    });

    return (
        <Table>
            <Table.Thead>
                <Table.Tr bg="table-header">
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Affiliation</Table.Th>
                    <Table.Th>Contact</Table.Th>
                    <Table.Th>View</Table.Th>
                    <Table.Th>Edit</Table.Th>
                    <Table.Th>Peer Review</Table.Th>
                    <Table.Th>Publish</Table.Th>
                    <Table.Th>Admin</Table.Th>
                    {includesImported ? <Table.Th>Type</Table.Th> : null}
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody bg="table-body">
                {rows}
            </Table.Tbody>
        </Table>
    )
}

const UserRow = ({user, adminUserId, includesImported}: { user: User, adminUserId: string, includesImported: boolean }) => {
    const [updatePermissions] = useMutation<UpdatePermissionsResponse, UpdatePermissionsVariables>(UPDATE_PERMISSIONS_MUTATION,
        {
            refetchQueries: ["UsersQuery"],
            onError: (e) => console.log(e)
        });

    const createBadge = useCallback((b: boolean) => {
        return <Badge variant="light" color={b ? "green" : "grape"}>{b ? "Registered" : "Imported"}</Badge>
    }, [user.authDirectoryId]);

    return (<Table.Tr key={user.id}>
            <Table.Td>{user.firstName} {user.lastName}</Table.Td>
            <Table.Td>{user.affiliation}</Table.Td>
            <Table.Td>{user.emailAddress}</Table.Td>
            <Table.Td>
                <PermissionsCheckBox userId={user.id} updatePermissions={updatePermissions}
                                     userPermissions={user.permissions}
                                     permission={UserPermissions.ViewReconstructions}/>
            </Table.Td>
            <Table.Td>
                <PermissionsCheckBox userId={user.id} updatePermissions={updatePermissions}
                                     userPermissions={user.permissions}
                                     permission={UserPermissions.Edit}/>
            </Table.Td>
            <Table.Td>
                <PermissionsCheckBox userId={user.id} updatePermissions={updatePermissions}
                                     userPermissions={user.permissions}
                                     permission={UserPermissions.PeerReview}/>
            </Table.Td>
            <Table.Td>
                <PermissionsCheckBox userId={user.id} updatePermissions={updatePermissions}
                                     userPermissions={user.permissions}
                                     permission={UserPermissions.FullReview}/>
            </Table.Td>
            <Table.Td>
                <PermissionsCheckBox userId={user.id} updatePermissions={updatePermissions}
                                     userPermissions={user.permissions}
                                     permission={UserPermissions.Admin} disabled={user.id == adminUserId}/>
            </Table.Td>
            {includesImported ? <Table.Td>{createBadge(user.authDirectoryId != null)}</Table.Td> : null}
        </Table.Tr>
    );
}
