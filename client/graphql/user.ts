import gql from "graphql-tag";
import {User} from "../models/user";

/*
    This will toggle display of a top-level tab, but does not affect the data shown or requests that can be made.  That is enforced through authorization
    on the backend.
 */
export enum UserPermissions {
    None = 0x00,
    View = 0x01,
    // Any view permutations through 0x80
    ViewReconstructions = 0x02,
    ViewAll = View | ViewReconstructions,
    Edit = 0x10,
    // Any edit permutations through 0x800
    EditAll = Edit,
    FullReview = 0x100,
    PeerReview = 0x200,
    // Any review permutations through 0x8000
    ReviewAll = PeerReview | FullReview,
    Admin = 0x1000,
    // Any admin permutations through 0x80000
    AdminAll = Admin
}

export const USER_QUERY = gql`
    query UserQuery {
        user {
            id
            authDirectoryId
            firstName
            lastName
            emailAddress
            affiliation
            permissions
        }
    }
`;

export type UserQueryResponse = {
    user: User;
}

export const USERS_QUERY = gql`
    query UsersQuery($input: UserQueryInput) {
        users(input: $input) {
            totalCount
            items {
                id
                authDirectoryId
                firstName
                lastName
                emailAddress
                affiliation
                permissions
            }
        }
    }
`;

export type UserQueryVariables = {
    input: {
        offset: number;
        limit: number;
        includeImported: boolean;
    }
}

export type UsersQueryResponse = {
    users: {
        totalCount: number,
        items: User[]
    }
}

//
// Update Permissions Mutation
//
export const UPDATE_PERMISSIONS_MUTATION = gql`mutation UpdateUserPermissions($id: String!, $permissions: Int!) {
    updateUserPermissions(id: $id, permissions: $permissions) {
        id
        firstName
        lastName
        emailAddress
        affiliation
        permissions
    }
}`;

export type UpdatePermissionsVariables = {
    id: string;
    permissions: number;
}

export type UpdatePermissionsResponse = {
    updatePermissions: User;
}
