import gql from "graphql-tag";

import {INeuron} from "../models/neuron";
import {ReconstructionFieldsFragment} from "./reconstruction";
import {ITracingNode} from "../models/tracingNode";
import {SearchPredicate} from "../models/searchPredicate";

export const SEARCH_NEURONS_QUERY = gql`query SearchNeurons($context: SearchContext) {
    searchNeurons(context: $context) {
        nonce
        queryTime
        totalCount

        neurons {
            id
            idString
            consensus
            brainArea {
                id
                acronym
            }
            sample {
                id
                idNumber
                animalId
            }
            latest {
                ...ReconstructionFields
            }
        }

        error {
            name
            message
        }
    }
}
${ReconstructionFieldsFragment}`;

export type SearchContext = {
    nonce: string,
    predicates: SearchPredicate[];
}

export type SearchNeuronsQueryVariables = {
    context: SearchContext;
}

export type SearchNeuronsQueryData = {
    neurons: INeuron[];
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
            brainStructureId
            structureIdentifierId
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
        node: ITracingNode;
        error: String;
    }
}
