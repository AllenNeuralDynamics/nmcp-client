import gql from "graphql-tag";

import {IBrainArea} from "../models/brainArea";

export const COMPARTMENT_FIELDS_FRAGMENT = gql`fragment CompartmentFields on BrainArea {
    id
    name
    structureId
    depth
    parentStructureId
    structureIdPath
    safeName
    acronym
    aliasList
    atlasId
    graphId
    graphOrder
    hemisphereId
    geometryFile
    geometryColor
    geometryEnable
    createdAt
    updatedAt
}`;

export const COMPARTMENTS_QUERY = gql`query {
    brainAreas {
        ...CompartmentFields
    }
}
${COMPARTMENT_FIELDS_FRAGMENT}
`;

export type CompartmentsQueryResponse = {
    brainAreas: IBrainArea[];
}
