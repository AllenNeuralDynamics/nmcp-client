import gql from "graphql-tag";
import {INeuron, SomaProperties} from "../models/neuron";
import {ConsensusStatus} from "../models/consensusStatus";


// brainAreaId is used to determine whether the brain area is inherited or not.  brainAreas{} is the resolved brain are
// (specified or inherited).

const NEURON_RELATIONSHIP_FIELDS_FRAGMENT = gql`fragment NeuronRelationshipFields on Neuron {
    brainArea {
        id
        name
    }
    sample {
        id
        idNumber
        animalId
        sampleDate
    }
    reconstructions {
        id
    }
}`;

export const NEURON_BASE_FIELDS_FRAGMENT = gql`fragment NeuronBaseFields on Neuron {
    id
    idNumber
    idString
    tag
    keywords
    x
    y
    z
    sampleX
    sampleY
    sampleZ
    doi
    consensus
    metadata
    tag
    brainStructureId
    createdAt
    updatedAt
}`;

///
/// Neurons Query
///

export const NEURONS_QUERY = gql`query NeuronsQuery($input: NeuronQueryInput) {
    neurons(input: $input) {
        totalCount
        items {
            ...NeuronBaseFields
            ...NeuronRelationshipFields
        }
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

export type NeuronsQueryVariables = {
    input: {
        offset?: number,
        limit?: number,
        sortOrder?: string
        sampleIds?: string[]
        reconstructionStatus?: number;
    }
}

export type NeuronsQueryData = {
    totalCount: number;
    items: INeuron[];
}

export type NeuronsQueryResponse = {
    neurons: NeuronsQueryData;
}

///
/// Mutation Input
///

type NeuronVariables = {
    id?: string;
    idNumber?: number;
    idString?: string;
    tag?: string;
    keywords?: string;
    x?: number;
    y?: number;
    z?: number;
    consensus?: ConsensusStatus;
    sampleId?: string;
    brainStructureId?: string;
}

///
/// Create Neuron Mutation
///

export const CREATE_NEURON_MUTATION = gql`mutation CreateNeuron($neuron: NeuronInput) {
    createNeuron(neuron: $neuron) {
        source {
            ...NeuronBaseFields
            ...NeuronRelationshipFields
        }
        error
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

export type CreateNeuronVariables = {
    neuron: NeuronVariables;
}

export type CreateNeuronMutationData = {
    source: INeuron;
    error: string;
}

export type CreateNeuronMutationResponse = {
    createNeuron: CreateNeuronMutationData;
}

///
/// Update Neuron Mutation
///

export const UPDATE_NEURON_MUTATION = gql`mutation UpdateNeuron($neuron: NeuronInput) {
    updateNeuron(neuron: $neuron) {
        source {
            ...NeuronBaseFields
            ...NeuronRelationshipFields
        }
        error
    }
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}
`;

export type UpdateNeuronVariables = {
    neuron: NeuronVariables;
}

export type UpdateNeuronMutationData = {
    source: INeuron;
    error: string;
}

export type UpdateNeuronMutationResponse = {
    updateNeuron: UpdateNeuronMutationData;
}

///
/// Delete Neuron Mutation
///

export const DELETE_NEURON_MUTATION = gql`mutation DeleteNeuron($id: String!) {
    deleteNeuron(id: $id) {
        id
        error
    }
}`;

export type DeleteNeuronVariables = {
    id: string;
}

export type DeleteNeuronMutationData = {
    id: string,
    error: string;
}

export type DeleteNeuronMutationResponse = {
    deleteNeuron: DeleteNeuronMutationData;
}

///
/// Import Somas Mutation
///

export const IMPORT_SOMAS_MUTATION = gql`mutation($file: Upload!, $options: ImportSomasOptions!) {
    importSomas(file: $file, options: $options) {
        count
        idStrings
        error {
            name
            message
        }
    }
}`;

export type ImportSomasVariables = {
    file: File;
    options: {
        sampleId: string;
        tag: string;
        shouldLookupSoma: boolean;
        noEmit: boolean;
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
