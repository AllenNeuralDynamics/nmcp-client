import gql from "graphql-tag";

export const AtlasReconstructionFieldsFragment = gql`fragment AtlasReconstructionFields on AtlasReconstruction {
    id
    sourceUrl
    status
    lengthMillimeters
    reviewer {
        id
        firstName
        lastName
    }
}`;

