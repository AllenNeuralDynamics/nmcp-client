import gql from "graphql-tag";

const UnregisteredTracingFieldsFragment = gql`fragment UnregisteredTracingFields on UnregisteredTracing {
    id
    filename
    nodeCount
    pathCount
    branchCount
    endCount
    createdAt
    updatedAt
    tracingStructure {
        id
        name
        value
    }
}`;

//
// Upload/Create Unregistered Tracing Mutation
//

export const UPLOAD_UNREGISTERED_TRACING_MUTATION = gql`
    mutation uploadUnregisteredSwc($reconstructionId: String, $structureId: String, $file: Upload) {
        uploadUnregisteredSwc(reconstructionId: $reconstructionId, structureId: $structureId, file: $file) {
            tracings {
                ...UnregisteredTracingFields
            }
            error {
                name
                message
            }
        }
    }${UnregisteredTracingFieldsFragment}`;
