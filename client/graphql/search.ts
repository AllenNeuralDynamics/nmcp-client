import gql from "graphql-tag";

import {INeuron} from "../models/neuron";
import {IPositionInput} from "../models/queryFilter";
import {PredicateTypeValue} from "../models/brainAreaFilterType";

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
    }
    
    error {
      name
      message
    }
  }
}`;

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
