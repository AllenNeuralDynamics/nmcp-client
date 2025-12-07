import gql from "graphql-tag";

import {SpecimenShape, Tomography} from "../models/specimen";

export const SPECIMEN_FIELDS_FRAGMENT = gql`fragment SpecimenFields on Specimen {
    id
    label
    notes
    referenceDate
    tomography {
        url
        options {
            range
            window
        }
    }
    collectionId
    neuronCount
    somaProperties {
        defaultBrightness
        defaultVolume
    }
    genotype {
        id
        name
    }
    injections {
        id
        atlasStructure {
            id
            name
        }
    }
    collection {
        id
        name
    }
    createdAt
    updatedAt
}
`;

///
/// Specimen Query
///

export const SPECIMEN_QUERY = gql`query SpecimenQuery($id: String!) {
    specimen(id: $id) {
        ...SpecimenFields
    }
}
${SPECIMEN_FIELDS_FRAGMENT}
`;

export type SpecimenQueryResponse = {
    specimen: SpecimenShape;
}

export type SpecimenQueryVariables = {
    id: string;
}

///
/// Specimens Query
///

export const SPECIMENS_QUERY = gql`query SpecimensQuery($input: SpecimenQueryInput) {
    specimens(input: $input) {
        totalCount
        items {
            ...SpecimenFields
        }
    }
}
${SPECIMEN_FIELDS_FRAGMENT}
`;

export type SpecimensResponse = {
    totalCount: number;
    items: SpecimenShape[];
}

export type SpecimensQueryResponse = {
    specimens: SpecimensResponse;
}

///
/// Mutation Input
///

type SpecimenMutateArgs = {
    id?: string;
    label?: string;
    notes?: string;
    referenceDate?: number;
    tomography?: Tomography;
    genotypeId?: string;
    genotypeName?: string;
    collectionId?: string;
}

///
/// Create Specimen Mutation
///

export const SPECIMEN_SAMPLE_MUTATION = gql`mutation CreateSpecimen($specimen: SpecimenInput) {
    createSpecimen(specimen: $specimen) {
        ...SpecimenFields
    }
}
${SPECIMEN_FIELDS_FRAGMENT}
`;

export type CreateSpecimenVariables = {
    specimen: SpecimenMutateArgs;
}

export type CreateSampleMutationResponse = {
    createSpecimen: SpecimenShape;
}

///
/// Update Specimen Mutation
///

export const UPDATE_SPECIMEN_MUTATION = gql`mutation UpdateSpecimen($specimen: SpecimenInput) {
    updateSpecimen(specimen: $specimen) {
        ...SpecimenFields
    }
}
${SPECIMEN_FIELDS_FRAGMENT}
`;

export type UpdateSpecimenVariables = {
    specimen: SpecimenMutateArgs;
}

export type UpdateSpecimenMutationResponse = {
    updateSpecimen: SpecimenShape;
}

///
/// Delete Specimen Mutation
///

export const DELETE_SPECIMEN_MUTATION = gql`mutation DeleteSpecimen($id: String!) {
    deleteSpecimen(id: $id)
}`;

export type DeleteSpecimenVariables = {
    id: string;
}

export type DeleteSpecimenMutationResponse = {
    deleteSpecimen: string;
}
