import {IUser} from "./user";
import {INeuron} from "./neuron";

export enum IssueKind {
    Uncategorized = 0,
    Candidate = 10
}

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
    neuron?: INeuron;
    createdAt: number;
}

export function issueKindString(status: IssueKind): string {
    switch (status) {
        case IssueKind.Uncategorized:
            return "Uncategorized";
        case IssueKind.Candidate:
            return "Candidate";
        default:
            return "Unknown";
    }
}
