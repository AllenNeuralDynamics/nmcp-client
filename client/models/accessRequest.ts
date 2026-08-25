import {User} from "./user";

export enum RequestAccessResponse {
    Invalid = 0,
    Accepted = 100,
    DuplicateOpen = 200,
    DuplicateApproved = 220,
    DuplicateDenied = 240,
    Throttled = 300
}

export enum AccessRequestStatus {
    Unreviewed = 0,
    Pending = 100,
    Accepted = 200,
    Denied = 300
}

export const accessRequestStatusName = (status: AccessRequestStatus): string => {
    switch (status) {
        case AccessRequestStatus.Unreviewed:
            return "Unreviewed";
        case AccessRequestStatus.Pending:
            return "Pending";
        case AccessRequestStatus.Accepted:
            return "Accepted";
        case AccessRequestStatus.Denied:
            return "Denied";
        default:
            return "UNKNOWN";
    }
}

export const accessRequestStatusColor = (status: AccessRequestStatus): string => {
    switch (status) {
        case AccessRequestStatus.Unreviewed:
            return "gray";
        case AccessRequestStatus.Pending:
            return "blue";
        case AccessRequestStatus.Accepted:
            return "green";
        case AccessRequestStatus.Denied:
            return "red";
        default:
            return "black";
    }
}

export interface AccessRequestShape {
    firstName: string;
    lastName: string;
    emailAddress: string;
    affiliation: string;
    purpose: string;
}

export interface AccessRequest extends AccessRequestShape {
    id: string;
    notes: string;
    status: AccessRequestStatus;
    admin?: User;
    assigned?: User;
    createdAt: number;
    updatedAt: number;
}
