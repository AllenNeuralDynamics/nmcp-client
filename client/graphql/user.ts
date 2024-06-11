import gql from "graphql-tag";
import {IUser} from "../models/user";

export enum UserPermissions {
    None = 0x00,
    View = 0x01,
    // Any view permutations through 0x80
    ViewReconstructions = 0x02,
    ViewAll = View | ViewReconstructions,
    Edit = 0x10,
    // Any edit permutations through 0x800
    EditAll = Edit,
    Review = 0x100,
    // Any review permutations through 0x8000
    ReviewAll = Review,
    Admin = 0x1000,
    // Any admin permutations through 0x80000
    AdminAll = Admin
}

export const USER_QUERY = gql`
    query UserQuery {
        user {
            id
            firstName
            lastName
            emailAddress
            affiliation
            permissions
        }
    }
`;

export type UserQueryResponse = {
    user: IUser;
}

export const USERS_QUERY = gql`
    query UsersQuery {
        users {
            totalCount
            items {
                id
                firstName
                lastName
                emailAddress
                affiliation
                permissions
            }
        }
    }
`;

export type UsersQueryResponse = {
    users: {
        totalCount: number,
        items: IUser[]
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
    updatePermissions: IUser;
}
