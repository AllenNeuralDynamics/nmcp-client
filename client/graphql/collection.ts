import gql from "graphql-tag";

import {CollectionShape} from "../models/collection";

export const COLLECTION_FIELDS_FRAGMENT = gql`fragment CollectionFields on Collection {
    id
    name
    description
    reference
    specimenCount
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
    collections: CollectionShape[]
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

//
// Update collection mutation.
//
export const CREATE_COLLECTION_MUTATION = gql`mutation CreateCollection($collection: CollectionInput!) {
    createCollection(collection: $collection) {
            ...CollectionFields
    }
}
${COLLECTION_FIELDS_FRAGMENT}
`;

export type CreateCollectionOutput = {
    createCollection: CollectionShape;
}

//
// Update collection mutation.
//
export const UPDATE_COLLECTION_MUTATION = gql`mutation UpdateCollection($collection: CollectionInput!) {
    updateCollection(collection: $collection) {
        ...CollectionFields
    }
}
${COLLECTION_FIELDS_FRAGMENT}
`;

export type UpdateCollectionOutput = {
    updateCollection: CollectionShape;
}
