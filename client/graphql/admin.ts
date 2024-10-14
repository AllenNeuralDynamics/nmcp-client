import gql from "graphql-tag";

export const RELOAD_MUTATION = gql`mutation ReloadMutation {
    reload
}`;

export const UNPUBLISH_MUTATION = gql`mutation UnpublishMutation($id: String!) {
    unpublish(id: $id)
}`;


export const IMPORT_SMARTSHEET_MUTATION = gql`mutation ImportSmartSheetMutation($id: String!) {
    importSmartSheet(id: $id)
}`;
