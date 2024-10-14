import React, {useContext, useState} from "react";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {Checkbox, Dropdown, Header, List, Segment, Table, TableCell, TableRow} from "semantic-ui-react";

import {PaginationHeader} from "../editors/PaginationHeader";
import {IUser} from "../../models/user";
import {
    UPDATE_PERMISSIONS_MUTATION,
    UpdatePermissionsResponse,
    UpdatePermissionsVariables,
    UserPermissions, UserQueryVariables,
    USERS_QUERY,
    UsersQueryResponse
} from "../../graphql/user";
import {UserContext} from "../app/UserApp";

function noUsersText() {
    return "There are no users";
}

export const Users = () => {
    const [state, setState] = useState({
        offset: 0,
        limit: 10,
        includeImported: false
    });

    const user = useContext(UserContext);

    const {loading, error, data} = useQuery<UsersQueryResponse, UserQueryVariables>(USERS_QUERY, {
        variables: {input: {offset: state.offset, limit: state.limit, includeImported: state.includeImported}},
        pollInterval: 10000
    });

    if (loading || !data || !data.users) {
        return (<div/>)
    }

    const rows = data.users.items.map((t: IUser) => {
        return <UserRow key={`tt_${t.id}`} user={t} userId={user.id}/>
    });

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

    const totalCount = data.users.totalCount;

    const pageCount = Math.max(Math.ceil(totalCount / state.limit), 1);

    const activePage = state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1;

    const start = state.offset + 1;

    const end = Math.min(state.offset + state.limit, totalCount);

    return (
        <div style={{margin: "0"}}>
            <Segment.Group>
                <Segment secondary>
                    <Header style={{margin: "0"}}>Users</Header>
                </Segment>
                <Segment secondary>
                    <List horizontal divided>
                        <List.Item>
                            <Checkbox toggle label="Include imported" checked={state.includeImported}
                                      onChange={(_, data) => setState({...state, includeImported: data.checked})}/>
                        </List.Item>
                    </List>
                </Segment>
                <Segment>
                    <PaginationHeader pageCount={pageCount} activePage={activePage}
                                      limit={state.limit}
                                      onUpdateLimitForPage={onUpdateLimit}
                                      onUpdateOffsetForPage={onUpdateOffsetForPage}/>
                </Segment>
                <Table attached="bottom" compact="very">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Affiliation</Table.HeaderCell>
                            <Table.HeaderCell>Contact</Table.HeaderCell>
                            <Table.HeaderCell>View</Table.HeaderCell>
                            <Table.HeaderCell>Edit</Table.HeaderCell>
                            <Table.HeaderCell>Review</Table.HeaderCell>
                            <Table.HeaderCell>Admin</Table.HeaderCell>
                            <Table.HeaderCell>Type</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                    <Table.Footer fullwidth="true">
                        <Table.Row>
                            <Table.HeaderCell colSpan={6}>
                                {totalCount >= 0 ? (totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} users` : noUsersText()) : ""}
                            </Table.HeaderCell>
                            <Table.HeaderCell colSpan={7} textAlign="right">
                                {`Page ${activePage} of ${pageCount}`}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            </Segment.Group>
        </div>
    );
}

function calculatePermissions(permissions: number, permission: number, b: boolean): number {
    if (b) {
        return permissions | permission;
    }

    return permissions & ~permission;
}

interface IPermissionsCheckBoxProps {
    userId: string;
    updatePermissions: any;
    userPermissions: number;
    permission: number;
    disabled?: boolean;
}


const PermissionsCheckBox = (props: IPermissionsCheckBoxProps) => {
    return <Checkbox checked={(props.userPermissions & props.permission) != 0} disabled={props.disabled}
                     onChange={(e, data) =>
                         props.updatePermissions({
                             variables: {
                                 id: props.userId,
                                 permissions: calculatePermissions(props.userPermissions, props.permission, data.checked)
                             }
                         })}/>

}

interface IUserRowProps {
    user: IUser;
    userId: string;
}

const UserRow = (props: IUserRowProps) => {
    const [updatePermissions, {data: reviewData}] = useMutation<UpdatePermissionsResponse, UpdatePermissionsVariables>(UPDATE_PERMISSIONS_MUTATION,
        {
            refetchQueries: ["UsersQuery"]
        });

    return (<TableRow>
            <TableCell>{props.user.firstName} {props.user.lastName}</TableCell>
            <TableCell>{props.user.affiliation}</TableCell>
            <TableCell>{props.user.emailAddress}</TableCell>
            <TableCell>
                <PermissionsCheckBox userId={props.user.id} updatePermissions={updatePermissions}
                                     userPermissions={props.user.permissions}
                                     permission={UserPermissions.ViewReconstructions}/>
            </TableCell>
            <TableCell>
                <PermissionsCheckBox userId={props.user.id} updatePermissions={updatePermissions}
                                     userPermissions={props.user.permissions}
                                     permission={UserPermissions.Edit}/>
            </TableCell>
            <TableCell>
                <PermissionsCheckBox userId={props.user.id} updatePermissions={updatePermissions}
                                     userPermissions={props.user.permissions}
                                     permission={UserPermissions.Review}/>
            </TableCell>
            <TableCell>
                <PermissionsCheckBox userId={props.user.id} updatePermissions={updatePermissions}
                                     userPermissions={props.user.permissions}
                                     permission={UserPermissions.Admin} disabled={props.user.id == props.userId}/>
            </TableCell>
            <TableCell>{props.user.authDirectoryId ? "Registered" : "Imported"}</TableCell>
        </TableRow>
    );
}
