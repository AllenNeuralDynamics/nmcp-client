import gql from "graphql-tag";

import {SpecimenShape} from "../models/specimen";

export const SPECIMEN_FIELDS_FRAGMENT = gql`fragment SpecimenFields on Specimen {
    id
    label
    notes
    referenceDate
    tomographyUrl
    collectionId
    neuronCount
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
    neurons {
        id
        label
    }
    createdAt
    updatedAt
}
`;

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

export type SamplesQueryResponse = {
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
