import {IUser} from "./user";

export enum IssueStatus {
    Unreviewed = 0,
    Closed = 99
}

export interface IIssue {
    id: string;
    kind: number;
    status: IssueStatus;
    description: string;
    response: string;
    creator?: IUser;
}
