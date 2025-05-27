import gql from "graphql-tag";

import {ITracingStructure} from "../models/tracingStructure";
import {IStructureIdentifier} from "../models/structureIdentifier";
import {IQueryOperator} from "../models/queryOperator";
import {IBrainArea} from "../models/brainArea";

export const CONSTANTS_QUERY = gql`query ConstantsQuery {
  systemSettings {
    apiVersion
    neuronCount
    features {
      enableUpdatedViewer
    }
  }
  tracingStructures {
    id
    name
    value
  }
  structureIdentifiers {
    id
    name
    value
  }
  queryOperators {
    id
    display
    operator
  }
  brainAreas {
    id
    name
    acronym
    aliasList
    structureId
    depth
    parentStructureId
    structureIdPath
    geometryColor
    geometryFile
    geometryEnable
  }
}`;

export interface ISystemSettings {
    apiVersion: string;
    neuronCount: number;
    features: {
      enableUpdatedViewer: boolean;
    }
}

export interface ConstantsQueryResponse {
    systemSettings: ISystemSettings;
    tracingStructures: ITracingStructure[];
    structureIdentifiers: IStructureIdentifier[];
    queryOperators: IQueryOperator[];
    brainAreas: IBrainArea[];
}
