import gql from "graphql-tag";

import {NeuronStructureShape} from "../models/neuronStructure";
import {NodeStructureShape} from "../models/structureIdentifier";
import {IQueryOperator} from "../models/queryOperator";
import {AtlasShape} from "../models/atlas";
import {AtlasKindShape} from "../models/atlasKind";

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
  atlasKinds {
    id
    name
    description
    kind
    family
    createdAt
    updatedAt
  }
  atlases {
    id
    name
    description
    reference
    geometryUrl
    rootStructureId
    atlasKindId
    createdAt
    updatedAt
    atlasStructures {
      id
      name
      acronym
      aliases
      structureId
      depth
      parentStructureId
      structureIdPath
      defaultColor
      hasGeometry
      atlasId
    }
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
    atlasKinds: AtlasKindShape[];
    atlases: AtlasShape[];
}
