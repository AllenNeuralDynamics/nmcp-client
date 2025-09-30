import gql from "graphql-tag";

import {INeuron} from "../models/neuron";
import {IPositionInput} from "../viewmodel/queryFilter";
import {PredicateTypeValue} from "../models/brainAreaFilterType";
import {ReconstructionFieldsFragment} from "./reconstruction";
import {ITracingNode} from "../models/tracingNode";

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
      tracings {
        id
        tracingStructure {
          id
          name
          value
        }
        soma {
          id
          x
          y
          z
          radius
          parentNumber
          sampleNumber
          brainStructureId
          structureIdentifierId
        }
      }
        reconstructions {
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

export type SearchPredicate = {
    predicateType: PredicateTypeValue;
    tracingIdsOrDOIs: string[];
    tracingIdsOrDOIsExactMatch: boolean;
    tracingStructureIds: string[];
    nodeStructureIds: string[];
    operatorId: string;
    amount: number;
    brainAreaIds: string[];
    arbCenter: IPositionInput;
    arbSize: number;
    invert: boolean;
    composition: number;
}

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
