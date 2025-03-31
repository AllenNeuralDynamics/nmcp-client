import gql from "graphql-tag";
import {IIssue, IssueKind} from "../models/issue";

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
