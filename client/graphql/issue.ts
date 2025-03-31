import gql from "graphql-tag";
import {IIssue, IssueKind} from "../models/issue";

export const OPEN_ISSUES_QUERY = gql`
    query OPEN_ISSUES_QUERY {
        openIssues {
            id
            kind
            status
            description
            response
            createdAt
            creator {
                id
                firstName
                lastName
                emailAddress
            }
            neuron {
                id
                idString
                sample {
                    id
                    animalId
                }
            }
        }
    }
`;

export type IssueQueryResponse = {
    openIssues: IIssue[];
}


//
// Create Mutation
//
export const CREATE_ISSUE_MUTATION = gql`mutation CreateIssue($neuronId: String, $reconstructionId: String, $kind: Int!, $description: String!) {
    createIssue(neuronId: $neuronId, reconstructionId: $reconstructionId, kind: $kind, description: $description) {
        id
        kind
        status
        description
        response
    }
}`;

export type CreateIssueVariables = {
    neuronId?: string;
    reconstructionId?: string;
    kind?: IssueKind;
    description: string;
}

export type CreateIssueResponse = {
    createIssue: IIssue;
}

//
// Close Mutation
//
export const CLOSE_ISSUE_MUTATION = gql`mutation CloseIssue($id: String!, $reason: String!) {
    closeIssue(id: $id, reason: $reason)
}`;

export type CloseIssueVariables = {
    id: string;
    reason: string;
}

export type CloseIssueResponse = {
    closeIssue: boolean;
}

