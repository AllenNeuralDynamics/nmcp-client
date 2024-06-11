import gql from "graphql-tag";

import {ISample} from "../models/sample";

export const SAMPLE_FIELDS_FRAGMENT = gql`fragment SampleFields on Sample {
    id
    idNumber
    animalId
    tag
    comment
    sampleDate
    visibility
    tomography
    neuronCount
    mouseStrain {
        id
        name
    }
    injections {
        id
        brainArea {
            id
            name
        }
    }
    neurons{
        id
        idString
        idNumber
        tag
    }
    createdAt
    updatedAt
}
`;

///
/// Samples Query
///

export const SAMPLES_QUERY = gql`query {
    samples {
        totalCount
        items {
            ...SampleFields
        }
    }
}
${SAMPLE_FIELDS_FRAGMENT}
`;

///
/// Mutation Input
///

type SampleVariables = {
    id?: string;
    idNumber?: number;
    animalId?: string;
    tag?: string;
    aliases?: string[];
    comment?: string;
    sampleDate?: number;
    visibility?: number;
    mouseStrainId?: string;
    mouseStrainName?: string;
}

///
/// Create Sample Mutation
///

export const CREATE_SAMPLE_MUTATION = gql`mutation CreateSample($sample: SampleInput) {
    createSample(sample: $sample) {
        source {
           ...SampleFields
        }
        error 
    }
}
${SAMPLE_FIELDS_FRAGMENT}
`;

export type CreateSampleVariables = {
    sample: SampleVariables;
}

export type CreateSampleMutationData = {
    source: ISample;
    error: string;
}

export type CreateSampleMutationResponse = {
    createSample: CreateSampleMutationData;
}

///
/// Update Sample Mutation
///

export const UPDATE_SAMPLE_MUTATION = gql`mutation UpdateSample($sample: SampleInput) {
    updateSample(sample: $sample) {
        source {
            ...SampleFields
        }
        error
    }
}
${SAMPLE_FIELDS_FRAGMENT}
`;

export type UpdateSampleVariables = {
    sample: SampleVariables;
}

export type UpdateSampleMutationData = {
    source: ISample;
    error: string;
}

export type UpdateSampleMutationResponse = {
    updateSample: UpdateSampleMutationData;
}

///
/// Delete Sample Mutation
///

export const DELETE_SAMPLE_MUTATION = gql`mutation DeleteSample($id: String!) {
    deleteSample(id: $id) {
        id
        error
    }
}`;

export type DeleteSampleVariables = {
    id: string;
}

export type DeleteSampleMutationData = {
    id: string,
    error: string;
}

export type DeleteSampleMutationResponse = {
    deleteSample: DeleteSampleMutationData;
}
