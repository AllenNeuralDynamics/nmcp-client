import gql from "graphql-tag";

export const AtlasReconstructionFieldsFragment = gql`fragment AtlasReconstructionFields on AtlasReconstruction {
    id
    sourceUrl
    status
    lengthMillimeters
    failureReason
    failedAt
    reviewer {
        id
        firstName
        lastName
    }
}`;

