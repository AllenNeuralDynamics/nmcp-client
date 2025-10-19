import {User} from "./user";
import {NeuronShape} from "./neuron";

export enum IssueKind {
    Uncategorized = 0,
    Candidate = 100
}

export enum IssueStatus {
    Unreviewed = 0,
    UnderInvestigation = 100,
    Closed = 1000
}

export enum IssueReferenceKind {
    Specimen = 1000,
    Neuron = 2000
}

export enum IssueResolutionKind {
    NotEnoughInformation = 100,
    NoLongerApplicable = 200,
    NotAnIssue = 300,
    NotFixing = 2000,
    Fixed = 1000,
    Other = 9000
}

export function issueStatusName(value: IssueStatus) {
    switch (value) {
        case IssueStatus.Unreviewed:
            return "Unreviewed";
        case IssueStatus.UnderInvestigation:
            return "Under Investigation";
        case IssueStatus.Closed:
            return "Closed";
    }
}

export function issueResolutionKindName(value: IssueResolutionKind) {
    switch (value) {
        case IssueResolutionKind.NotEnoughInformation:
            return "Not Enough Information";
        case IssueResolutionKind.NoLongerApplicable:
            return "No Longer Applicable";
        case IssueResolutionKind.NotAnIssue:
            return "Not An Issue";
        case IssueResolutionKind.NotFixing:
            return "Not Changing";
        case IssueResolutionKind.Fixed:
            return "Fixed";
        case IssueResolutionKind.Other:
            return "Other...";
    }
}

export type IssueReference = {
    id?: string;
    kind: IssueReferenceKind;
    details?: any;
}

export type IssueShape = {
    id: string;
    issueId: number;
    kind: IssueKind;
    status: IssueStatus;
    description: string;
    neuron?: NeuronShape;
    resolutionKind: IssueResolutionKind;
    resolution: string;
    references: IssueReference[];
    author: User;
    responder: User;
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
