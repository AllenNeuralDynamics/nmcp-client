import gql from "graphql-tag";
import {IssueShape, IssueKind, IssueReference, IssueResolutionKind, IssueStatus} from "../models/issue";

const ISSUE_FIELDS_FRAGMENT = gql`fragment IssueFields on Issue {
    id
    issueId
    kind
    status
    description
    resolutionKind
    resolution
    neuron {
        id
        label
        specimen {
            id
            label
        }
    }
    author {
        id
        firstName
        lastName
        emailAddress
    }
    createdAt
}`;

export const OPEN_ISSUES_QUERY = gql`
    query OpenIssuesQuery{
        openIssues {
            ...IssueFields
        }
    }
    ${ISSUE_FIELDS_FRAGMENT}
`;

export type IssueQueryResponse = {
    openIssues: IssueShape[];
}

export const ISSUE_COUNT_QUERY = gql`
    query IssueCountQuery{
        issueCount
    }
`;

export type IssueCountResponse = {
    issueCount: number;
}

//
// Open
//
export const OPEN_ISSUE_MUTATION = gql`mutation OpenIssue($kind: Int!, $description: String!, $references: [IssueReferenceInput!]!) {
    openIssue(kind: $kind, description: $description, references: $references) {
        ...IssueFields
    }
}
${ISSUE_FIELDS_FRAGMENT}
`;

export type OpenIssueVariables = {
    kind: IssueKind;
    description: string;
    references: IssueReference[];
}

export type OpenIssueResponse = {
    openIssue: IssueShape;
}

//
// Modify
//
export const MODIFY_ISSUE_MUTATION = gql`mutation ModifyIssue($id: String!, $status: Int!) {
    modifyIssue(id: $id, status: $status) {
        ...IssueFields
    }
}
${ISSUE_FIELDS_FRAGMENT}
`;

export type ModifyIssueVariables = {
    id: string;
    status: IssueStatus;
}

export type ModifyIssueResponse = {
    modifyIssue: IssueShape;
}

//
// Close
//
export const CLOSE_ISSUE_MUTATION = gql`mutation CloseIssue($id: String!, $resolutionKind: Int!, $resolution: String!) {
    closeIssue(id: $id, resolutionKind: $resolutionKind, resolution: $resolution) {
        ...IssueFields
    }
}
${ISSUE_FIELDS_FRAGMENT}
`;

export type CloseIssueVariables = {
    id: string;
    resolutionKind: IssueResolutionKind;
    resolution: string;
}

export type CloseIssueResponse = {
    closeIssue: IssueShape;
}
