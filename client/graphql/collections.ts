import gql from "graphql-tag";

import {ICollection} from "../models/collection";

export const COLLECTION_FIELDS_FRAGMENT = gql`fragment CollectionFields on Collection {
    id
    name
    description
    reference
}`;

//
// All collections query.
//
export const COLLECTIONS_QUERY = gql`query CollectionsQuery {
    collections {
        ...CollectionFields
    }
}
${COLLECTION_FIELDS_FRAGMENT}
`;

export type CollectionsResponse = {
    collections: ICollection[]
}

//
// Mutate collections.
//

export type MutateCollectionVariables = {
    collection: {
        id?: string;
        name?: string;
        description?: string;
        reference?: string;
    }
}

export type MutateCollectionOutput = {
    source: ICollection;
    error: string;
}

//
// Update collection mutation.
//
export const CREATE_COLLECTION_MUTATION = gql`mutation CreateCollection($collection: CollectionInput!) {
    createCollection(collection: $collection) {
        source {
            ...CollectionFields
        }
        error
    }
}
${COLLECTION_FIELDS_FRAGMENT}
`;


//
// Update collection mutation.
//
export const UPDATE_COLLECTION_MUTATION = gql`mutation UpdateCollection($collection: CollectionInput!) {
    updateCollection(collection: $collection) {
        source {
            ...CollectionFields
        }
        error
    }
}
${COLLECTION_FIELDS_FRAGMENT}
`;
