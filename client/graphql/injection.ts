import gql from "graphql-tag";

import {IInjection} from "../models/injection";
import {IFluorophore} from "../models/fluorophore";
import {IInjectionVirus} from "../models/injectionVirus";

///
/// Fragments
///

export const INJECTION_FIELDS_FRAGMENT = gql`fragment InjectionFields on Injection {
    id
    injectionVirus {
        id
        name
    }
    fluorophore {
        id
        name
    }
    brainArea {
        id
        name
    }
}
`;

///
/// Sample-Related Queries
///

export const INJECTIONS_FOR_SAMPLE_QUERY = gql`query InjectionsForSample($input: InjectionQueryInput) {
    injections(input: $input) {
        ...InjectionFields
    }
    injectionViruses {
        id
        name
    }
    fluorophores {
        id
        name
    }
}
${INJECTION_FIELDS_FRAGMENT}
`;

export type InjectionsForSampleVariables = {
    input: {
        sampleIds: string[]
    }
}

export type InjectionsForSampleQueryResponse = {
    injections: IInjection[];
    injectionViruses: IInjectionVirus[];
    fluorophores: IFluorophore[];
}

///
/// Mutation Types
///

export type InjectionVariables = {
    id: string;
    brainAreaId?: string;
    injectionVirusId?: string;
    injectionVirusName?: string;
    fluorophoreId?: string;
    fluorophoreName?: string;
    sampleId?: string;
}

///
/// Create Injection Mutation
///

export const CREATE_INJECTION_MUTATION = gql`mutation CreateInjection($injectionInput: InjectionInput) {
    createInjection(injectionInput: $injectionInput) {
        source {
            ...InjectionFields
        }
        error
    }
}
${INJECTION_FIELDS_FRAGMENT}
`;

export type CreateInjectionVariables = {
    injectionInput: InjectionVariables;
}

export type CreateInjectionMutationData = {
    source: IInjection;
    error: string;
}

export type CreateInjectionMutationResponse = {
    createInjection: CreateInjectionMutationData;
}

///
/// Update Injection Mutation
///

export const UPDATE_INJECTION_MUTATION = gql`mutation UpdateInjection($injectionInput: InjectionInput) {
    updateInjection(injectionInput: $injectionInput) {
        source {
            ...InjectionFields
        }
        error
    }
}
${INJECTION_FIELDS_FRAGMENT}
`;

export type UpdateInjectionVariables = {
    injectionInput: InjectionVariables;
}

export type UpdateInjectionMutationData = {
    source: IInjection;
    error: string;
}

export type UpdateInjectionMutationResponse = {
    updateInjection: UpdateInjectionMutationData;
}

///
/// Delete Injection Mutation
///

export const DELETE_INJECTION_MUTATION = gql`mutation DeleteInjection($id: String!) {
    deleteInjection(id: $id) {
        id
        error
    }
}`;

export type DeleteInjectionVariables = {
    id: string;
}

export type DeleteInjectionMutationData = {
    id: string,
    error: string;
}

export type DeleteInjectionMutationResponse = {
    deleteInjection: DeleteInjectionMutationData;
}
