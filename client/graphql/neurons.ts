import gql from "graphql-tag";
import {Query} from "react-apollo";

import {INeuron} from "../models/neuron";
import {IPositionInput} from "../models/queryFilter";
import {PredicateTypeValue, PredicateType} from "../models/brainAreaFilterType";
import {CcfVersion, SearchScope} from "../models/uiQueryPredicate";

export const NEURONS_QUERY = gql`query SearchNeurons($context: SearchContext) {
  searchNeurons(context: $context) {
    nonce
    ccfVersion
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
    scope: SearchScope,
    ccfVersion: CcfVersion,
    predicates: SearchPredicate[];
}

type NeuronsQueryVariable = {
    context: SearchContext;
}

export type NeuronsQueryData = {
    neurons: INeuron[];
    totalCount: number;
    queryTime: number;
    nonce: string;
    error: Error;
}

type NeuronsQueryResponse = {
    searchNeurons: NeuronsQueryData
}

export class NeuronsQuery extends Query<NeuronsQueryResponse, NeuronsQueryVariable> {
}
