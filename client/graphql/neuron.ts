import gql from "graphql-tag";
import {INeuron} from "../models/neuron";
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
        sampleDate
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
    visibility
    doi
    consensus
    metadata
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
        offset: number,
        limit: number,
        sortOrder: string
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
/// Neuron Tracing Count Query
///

export const NEURON_TRACING_COUNT_QUERY = gql`query ReconstructionForNeuronsCount($ids: [String!]) {
    reconstructionCountsForNeurons(ids: $ids) {
        counts {
            id
            count
        }
        error
    }
}`;

export type NeuronTracingCountVariables = {
    ids: string[]
}

export type NeuronTracingCount = {
    id: string;
    count: number;
}

export type NeuronTracingCountQueryData = {
    counts: NeuronTracingCount[];
    error: string;
}

export type NeuronTracingCountResponse = {
    reconstructionCountsForNeurons: NeuronTracingCountQueryData;
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
    visibility?: number;
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

//
// Upload Neuron Annotation Metadata Mutation
//

export const UPLOAD_NEURON_ANNOTATION_METADATA_MUTATION = gql`
    mutation uploadAnnotationMetadata($neuronId: String, $file: Upload) {
        uploadAnnotationMetadata(neuronId: $neuronId,file: $file) {
            metadata
            error
        }
    }`;

export type UploadAnnotationMetadataVariables = {
    neuronId: string;
    file: File
}

export type UploadAnnotationMetadataMutationData = {
    metadata: string
    error: string
}

export type UploadAnnotationMetadataResponse = {
    uploadAnnotationMetadata: UploadAnnotationMetadataMutationData;
}
