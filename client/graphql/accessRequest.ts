import gql from "graphql-tag";

import {AccessRequestShape, RequestAccessResponse} from "../models/accessRequest";

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
