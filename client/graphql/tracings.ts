import gql from "graphql-tag";
import { Mutation } from '@apollo/client/react/components';

import {ISwcTracing} from "../models/swcTracing";

const TracingFieldsFragment = gql`fragment TracingFields on Tracing {
    id
    filename
    nodeCount
    pathCount
    branchCount
    endCount
    searchTransformAt
    createdAt
    updatedAt
    soma {
        id
        x
        y
        z
        brainStructure {
            id
            name
        }
    }
    tracingStructure {
        id
        name
        value
    }
}`;

//
// Upload/Create Tracing Mutation
//

export const UPLOAD_TRACING_MUTATION = gql`
    mutation uploadSwc($neuronId: String, $structureId: String, $file: Upload) {
        uploadSwc(neuronId: $neuronId, structureId: $structureId, file: $file) {
            tracings {
                ...TracingFields
            }
            error {
                name
                message
            }
        }
    }${TracingFieldsFragment}`;

export type UploadTracingVariables = {
    neuronId: string;
    structureId: string;
    file: File
}

export type UploadTracingMutationData = {
    tracings: ISwcTracing[];
    error: {
        name: string;
        message: string;
    }
}

export type UploadTracingMutationResponse = {
    uploadSwc: UploadTracingMutationData;
}

//
// Apply Transform Mutation
//
export const APPLY_TRANSFORM_MUTATION = gql`mutation applyTransform($id: String!) {
    applyTransform(id: $id) {
        tracing {
            id
        }
        error
    }
}`;

type ApplyTransformVariables = {
    id: string;
}

type ApplyTransformMutationData = {
    tracing: ISwcTracing;
    error: string;
}

type ApplyTransformMutationResponse = {
    applyTransform: ApplyTransformMutationData;
}

//
// Delete Tracing Mutation
//

export const DELETE_TRACING_MUTATION = gql`mutation deleteTracing($id: String!) {
    deleteTracing(id: $id) {
        id
        error
    }
}`;

type DeleteTracingVariables = {
    id: string;
}

type DeleteTracingMutationData = {
    id: string;
    error: string;
}

type DeleteTracingMutationResponse = {
    deleteTracing: DeleteTracingMutationData;
}
