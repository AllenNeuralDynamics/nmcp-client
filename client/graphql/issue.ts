import gql from "graphql-tag";
import {IIssue} from "../models/issue";

export const ISSUE_QUERY = gql`
    query ISSUE_QUERY {
        openIssues {
            id
            kind
            status
            description
            response
        }
    }
`;

export type IssueQueryResponse = {
    openIssues: IIssue[];
}


//
// Create Mutation
//
export const CREATE_ISSUE_MUTATION = gql`mutation CreateIssue($description: String!, $neuronId: String, $reconstructionId: String) {
    createIssue(description: $description, neuronId: $neuronId, reconstructionId: $reconstructionId) {
        id
        kind
        status
        description
        response
    }
}`;

export type CreateIssueVariables = {
    description: string;
    neuronId?: string;
    reconstructionId?: string;
}

export type CreateIssueResponse = {
    createIssue: IIssue;
}
