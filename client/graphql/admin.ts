import gql from "graphql-tag";

export const UNPUBLISH_MUTATION = gql`mutation UnpublishMutation($id: String!) {
    unpublish(id: $id)
}`;
