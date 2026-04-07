import gql from "graphql-tag";

import {NeuronShape, NeuronStatus, SomaFilterProperties, SomaLocation, SomaProperties} from "../models/neuron";


// brainStructureId is used to determine whether the brain area is inherited or not.  brainAreas{} is the resolved brain are
// (specified or inherited).

export const NEURON_RELATIONSHIP_FIELDS_FRAGMENT = gql`fragment NeuronRelationshipFields on Neuron {
    atlasStructure {
        id
        name
        structureId
    }
    specimen {
        id
        label
        referenceDataset {
            url
            segmentationUrl
        }
        tomography {
            url
            options {
                range
                window
            }
        }
        createdAt
    }
    published {
        id
        status
        doi
        searchIndexedAt
        updatedAt
    }
}`;

export const NEURON_BASE_FIELDS_FRAGMENT = gql`fragment NeuronBaseFields on Neuron {
    id
    label
    keywords
    specimenSoma {
        x
        y
        z
    }
    atlasSoma {
        x
        y
        z
    }
    atlasStructureId
    createdAt
    updatedAt
}`;

export const NEURON_VERSIONS_RELATIONSHIPS_FRAGMENT = gql`fragment NeuronVersionsRelationshipFields on Neuron {
    reconstructions {
        id
        status
        createdAt
        precomputed {
            id
            skeletonId
        }
        atlasReconstruction {
            id
            precomputed {
                id
                skeletonId
            }
            qualityControl {
                id
            }
            createdAt
        }
    }
}`;

export const NEURON_VERSIONS_QUERY = gql`query NeuronQuery($id: String!) {
    neuron(id: $id) {
        ...NeuronBaseFields
        ...NeuronRelationshipFields
        ...NeuronVersionsRelationshipFields
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
${NEURON_VERSIONS_RELATIONSHIPS_FRAGMENT}
`;

export type NeuronVersionsQueryVariables = {
    id: string;
}

export type NeuronVersionsQueryResponse = {
    neuron: NeuronShape;
}

///
/// Neurons Query
///

export const NEURONS_QUERY = gql`query NeuronsQuery($input: NeuronQueryInput) {
    neurons(input: $input) {
        totalCount
        items {
            ...NeuronBaseFields
            ...NeuronRelationshipFields
            reconstructionCount
        }
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

export type NeuronsQueryVariables = {
    input: {
        ids?: string[];
        specimenIds?: string[];
        atlasStructureIds?: string[];
        keywords?: string[];
        somaProperties?: SomaFilterProperties;
        status?: NeuronStatus;
        offset?: number;
        limit?: number;
    }
}

export type NeuronsQueryData = {
    totalCount: number;
    items: NeuronShape[];
}

export type NeuronsQueryResponse = {
    neurons: NeuronsQueryData;
}

///
/// Mutation Input
///

type NeuronVariables = {
    id?: string;
    label?: string;
    keywords?: string[];
    specimenSoma?: SomaLocation;
    atlasSoma?: SomaLocation;
    atlasStructureId?: string;
    specimenId?: string;
}

///
/// Create Neuron Mutation
///

export const CREATE_NEURON_MUTATION = gql`mutation CreateNeuron($neuron: NeuronInput) {
    createNeuron(neuron: $neuron) {
        ...NeuronBaseFields
        ...NeuronRelationshipFields
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

export type CreateNeuronVariables = {
    neuron: NeuronVariables;
}

export type CreateNeuronMutationResponse = {
    createNeuron: NeuronShape;
}

///
/// Update Neuron Mutation
///

export const UPDATE_NEURON_MUTATION = gql`mutation UpdateNeuron($neuron: NeuronInput) {
    updateNeuron(neuron: $neuron) {
        ...NeuronBaseFields
        ...NeuronRelationshipFields
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

export type UpdateNeuronVariables = {
    neuron: NeuronVariables;
}

export type UpdateNeuronMutationResponse = {
    updateNeuron: NeuronShape;
}

///
/// Delete Neuron Mutation
///

export const DELETE_NEURON_MUTATION = gql`mutation DeleteNeuron($id: String!) {
    deleteNeuron(id: $id)
}`;

export type DeleteNeuronVariables = {
    id: string;
}

export type DeleteNeuronMutationResponse = {
    deleteNeuron: string;
}

///
/// Bulk Update Neurons Mutations
///

export const UPDATE_NEURONS_MUTATION = gql`mutation UpdateNeurons($input: NeuronBulkUpdateInput!) {
    updateNeurons(input: $input) {
        ...NeuronBaseFields
        ...NeuronRelationshipFields
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

export type UpdateNeuronsVariables = {
    input: {
        ids: string[];
        keywords?: string[];
        atlasStructureId?: string;
    }
}

export type UpdateNeuronsResponse = {
    updateNeurons: NeuronShape[];
}

export const UPDATE_NEURONS_BY_QUERY_MUTATION = gql`mutation UpdateNeuronsByQuery($input: NeuronBulkUpdateByQueryInput!) {
    updateNeuronsByQuery(input: $input) {
        ...NeuronBaseFields
        ...NeuronRelationshipFields
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

export type UpdateNeuronsByQueryVariables = {
    input: {
        query: NeuronsQueryVariables["input"];
        keywords?: string[];
        atlasStructureId?: string;
    }
}

export type UpdateNeuronsByQueryResponse = {
    updateNeuronsByQuery: NeuronShape[];
}

///
/// Neuron Version History Query
///

const VERSION_HISTORY_EVENT_FRAGMENT = gql`fragment VersionHistoryEventFields on VersionHistoryEvent {
    id
    kind
    name
    details
    userId
    user {
        firstName
        lastName
        affiliation
    }
    createdAt
}`;

export const NEURON_VERSION_HISTORY_QUERY = gql`query NeuronVersionHistory($neuronId: String!) {
    neuronVersionHistory(neuronId: $neuronId) {
        neuronId
        specimen {
            ...VersionHistoryEventFields
        }
        trunk {
            ...VersionHistoryEventFields
        }
        branches {
            reconstructionId
            status
            startedAt
            events {
                ...VersionHistoryEventFields
            }
        }
    }
}
${VERSION_HISTORY_EVENT_FRAGMENT}`;

export type VersionHistoryEventUser = {
    firstName: string;
    lastName: string;
    affiliation: string;
}

export type VersionHistoryEvent = {
    id: string;
    kind: number;
    name: string;
    details: string;
    userId: string;
    user: VersionHistoryEventUser;
    createdAt: string;
}

export type VersionHistoryBranch = {
    reconstructionId: string;
    status: number;
    startedAt: string;
    events: VersionHistoryEvent[];
}

export type NeuronVersionHistory = {
    neuronId: string;
    specimen: VersionHistoryEvent[];
    trunk: VersionHistoryEvent[];
    branches: VersionHistoryBranch[];
}

export type NeuronVersionHistoryVariables = {
    neuronId: string;
}

export type NeuronVersionHistoryResponse = {
    neuronVersionHistory: NeuronVersionHistory;
}

///
/// Import Somas Mutation
///

export const IMPORT_SOMAS_MUTATION = gql`mutation($file: Upload!, $options: ImportSomasOptions!) {
    importSomas(file: $file, options: $options)
}`;

export type ImportSomasVariables = {
    file: File;
    options: {
        specimenId: string;
        keywords: string[];
        shouldLookupSoma: boolean;
        defaultBrightness: number;
        defaultVolume: number;
    }
}

export type ImportSomasMutationData = {
    count: number;
    idStrings: string[];
    error: {
        name: string;
        message: string;
    }
}

export type ImportSomasMutationResponse = {
    importSomas: ImportSomasMutationData;
}

