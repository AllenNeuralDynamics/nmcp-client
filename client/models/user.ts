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
