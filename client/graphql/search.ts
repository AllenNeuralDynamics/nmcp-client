import gql from "graphql-tag";

import {NeuronShape} from "../models/neuron";
import {SearchPredicate} from "../models/searchPredicate";
import {AtlasNode} from "../models/atlasNode";
import {NodeCountsFieldsFragment} from "./reconstruction";

export const SEARCH_NEURONS_QUERY = gql`query SearchNeurons($context: SearchContext) {
    searchNeurons(context: $context) {
        nonce
        queryTime
        totalCount

        neurons {
            id
            label
            atlasStructure {
                id
                acronym
            }
            specimen {
                id
                label
            }
            published {
                id
                status
                soma {
                    id
                    x
                    y
                    z
                    nodeStructureId
                    atlasStructureId
                }
                nodeCounts {
                    ...NodeCountsFields
                }
                precomputed {
                    id
                    skeletonId
                }
            }
        }

        error {
            name
            message
        }
    }
}
${NodeCountsFieldsFragment}
`;

export type SearchContext = {
    nonce: string,
    predicates: SearchPredicate[];
}

export type SearchNeuronsQueryVariables = {
    context: SearchContext;
}

export type SearchNeuronsQueryData = {
    neurons: NeuronShape[];
    totalCount: number;
    queryTime: number;
    nonce: string;
    error: Error;
}

export type SearchNeuronsQueryResponse = {
    searchNeurons: SearchNeuronsQueryData
}

//
// Nearest Node
//

export const NEAREST_NODE_QUERY = gql`query NearestNode($id: String!, $location: [Float!]!) {
    nearestNode(id: $id, location: $location) {
        reconstructionId
        location
        node {
            id
            x
            y
            z
            atlasStructureId
            nodeStructureId
        }
        error
    }
}
`;

export type NearestNodeQueryVariables = {
    id: string;
    location: number[];
}

export type NearestNodeQueryResponse = {
    nearestNode: {
        reconstructionId: string;
        location: number[];
        node: AtlasNode;
        error: string;
    }
}
