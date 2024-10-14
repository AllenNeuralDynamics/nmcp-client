import gql from "graphql-tag";

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
    mutation uploadSwc($reconstructionId: String, $structureId: String, $file: Upload) {
        uploadSwc(reconstructionId: $reconstructionId, structureId: $structureId, file: $file) {
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
    reconstructionId: string;
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
