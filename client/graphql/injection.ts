import gql from "graphql-tag";

import {InjectionShape} from "../models/injection";
import {FluorophoreShape} from "../models/fluorophore";
import {InjectionVirusShape} from "../models/injectionVirus";

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
    atlasStructure {
        id
        name
    }
}
`;

///
/// Sample-Related Queries
///

export const INJECTIONS_FOR_SPECIMEN_QUERY = gql`query InjectionsForSpecimen($input: InjectionQueryInput) {
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

export type InjectionsForSpecimenVariables = {
    input: {
        specimenIds: string[]
    }
}

export type InjectionsForSpecimenQueryResponse = {
    injections: InjectionShape[];
    injectionViruses: InjectionVirusShape[];
    fluorophores: FluorophoreShape[];
}

///
/// Mutation Types
///

export type InjectionVariables = {
    id?: string;
    specimenId?: string;
    atlasStructureId?: string;
    injectionVirusName?: string;
    fluorophoreName?: string;
}

///
/// Create Injection Mutation
///

export const CREATE_INJECTION_MUTATION = gql`mutation CreateInjection($injectionInput: InjectionInput) {
    createInjection(injectionInput: $injectionInput) {
        ...InjectionFields
    }
}
${INJECTION_FIELDS_FRAGMENT}
`;

export type CreateInjectionVariables = {
    injectionInput: InjectionVariables;
}

export type CreateInjectionMutationResponse = {
    createInjection: InjectionShape;
}

///
/// Update Injection Mutation
///

export const UPDATE_INJECTION_MUTATION = gql`mutation UpdateInjection($injectionInput: InjectionInput) {
    updateInjection(injectionInput: $injectionInput) {
        ...InjectionFields
    }
}
${INJECTION_FIELDS_FRAGMENT}
`;

export type UpdateInjectionVariables = {
    injectionInput: InjectionVariables;
}

export type UpdateInjectionMutationResponse = {
    updateInjection: InjectionShape;
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

export type DeleteInjectionMutationResponse = {
    deleteInjection: string;
}
