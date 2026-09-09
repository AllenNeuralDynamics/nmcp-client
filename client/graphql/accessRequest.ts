import gql from "graphql-tag";

import {AccessRequest, AccessRequestShape, AccessRequestStatus, RequestAccessResponse} from "../models/accessRequest";

//
// Open
//
export const REQUEST_ACCESS_MUTATION = gql`mutation RequestAccess($request: AccessRequestInput!) {
    requestAccess(request: $request)
}
`;

export type RequestAccessVariables = {
    request: AccessRequestShape;
}

export type RequestAccessMutationResponse = {
    requestAccess: RequestAccessResponse;
}

//
// Secure
//
const ACCESS_REQUEST_FIELDS_FRAGMENT = gql`fragment AccessRequestFields on AccessRequest {
    id
    firstName
    lastName
    emailAddress
    affiliation
    purpose
    notes
    status
    admin {
        id
        firstName
        lastName
    }
    assigned {
        id
        firstName
        lastName
    }
    createdAt
    updatedAt
}`;

export const ACCESS_REQUESTS_QUERY = gql`query AccessRequestsQuery($input: AccessRequestQueryInput) {
    accessRequests(input: $input) {
        totalCount
        offset
        items {
            ...AccessRequestFields
        }
    }
}
${ACCESS_REQUEST_FIELDS_FRAGMENT}
`;

export type AccessRequestsQueryVariables = {
    input: {
        status?: AccessRequestStatus[];
        offset?: number;
        limit?: number;
    }
}

export type AccessRequestsQueryResponse = {
    accessRequests: {
        totalCount: number;
        offset: number;
        items: AccessRequest[];
    }
}

export const UPDATE_ACCESS_REQUEST_STATUS_MUTATION = gql`mutation UpdateAccessRequestStatus($id: String!, $status: Int!) {
    updateAccessRequestStatus(id: $id, status: $status) {
        ...AccessRequestFields
    }
}
${ACCESS_REQUEST_FIELDS_FRAGMENT}
`;

export type UpdateAccessRequestStatusVariables = {
    id: string;
    status: AccessRequestStatus;
}

export type UpdateAccessRequestStatusResponse = {
    updateAccessRequestStatus: AccessRequest;
}
