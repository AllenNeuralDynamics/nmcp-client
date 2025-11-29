import gql from "graphql-tag";

import {NeuronShape, SomaLocation, SomaProperties} from "../models/neuron";


// brainStructureId is used to determine whether the brain area is inherited or not.  brainAreas{} is the resolved brain are
// (specified or inherited).

export const NEURON_RELATIONSHIP_FIELDS_FRAGMENT = gql`fragment NeuronRelationshipFields on Neuron {
    atlasStructure {
        id
        name
    }
    specimen {
        id
        label
    }
    published {
        id
        status
        searchIndexedAt
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

export const NEURON_VERSIONS_QUERY = gql`query NeuronQuery($id: String!) {
    neuron(id: $id) {
        ...NeuronBaseFields
        ...NeuronRelationshipFields
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
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
        keywords?: string[];
        somaProperties?: SomaProperties;
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

