import {UserPermissions} from "../graphql/user";

export interface User {
    id: string;
    authDirectoryId: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    affiliation: string;
    permissions: number;
}

export function formatUser(user: User, placeholder: string = "") {
    return user ? `${user.firstName} ${user.lastName}` : placeholder;
}

// Mirrors the API's admin bypass: an admin holds every permission.  A composite bits value matches on any one bit.
export function hasPermission(permissions: number, bits: UserPermissions): boolean {
    return ((permissions ?? 0) & (UserPermissions.Admin | bits)) != 0;
}
