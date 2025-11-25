export enum RequestAccessResponse {
    Invalid = 0,
    Accepted = 100,
    DuplicateOpen = 200,
    DuplicateApproved = 220,
    DuplicateDenied = 240,
    Throttled = 300
}

export interface AccessRequestShape {
    firstName: string;
    lastName: string;
    emailAddress: string;
    affiliation: string;
    purpose: string;
}
