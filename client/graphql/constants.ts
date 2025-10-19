import gql from "graphql-tag";

import {NeuronStructureShape} from "../models/neuronStructure";
import {NodeStructureShape} from "../models/structureIdentifier";
import {IQueryOperator} from "../models/queryOperator";
import {AtlasStructureShape} from "../models/atlasStructure";

export const CONSTANTS_QUERY = gql`query ConstantsQuery {
  systemSettings {
    apiVersion
    neuronCount
  }
  neuronStructures {
    id
    name
  }
  nodeStructures {
    id
    name
    swcValue
  }
  queryOperators {
    id
    display
    operator
  }
  atlasStructures {
    id
    name
    acronym
    aliasList
    structureId
    depth
    parentStructureId
    structureIdPath
    defaultColor
    hasGeometry
  }
}`;

export type SystemSettings = {
    apiVersion: string;
    neuronCount: number;
}

export type ConstantsQueryResponse = {
    systemSettings: SystemSettings;
    neuronStructures: NeuronStructureShape[];
    nodeStructures: NodeStructureShape[];
    queryOperators: IQueryOperator[];
    atlasStructures: AtlasStructureShape[];
}
