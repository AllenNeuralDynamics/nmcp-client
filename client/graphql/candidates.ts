import gql from "graphql-tag";

import {NeuronShape, SomaFilterProperties} from "../models/neuron";
import {NEURON_BASE_FIELDS_FRAGMENT, NEURON_RELATIONSHIP_FIELDS_FRAGMENT} from "./neuron";
import {ReconstructionFieldsFragment} from "./reconstruction";


export const NeuronFieldsFragment = gql`fragment NeuronFields on Neuron {
    ...NeuronBaseFields
    ...NeuronRelationshipFields
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}`;

export const CANDIDATE_NEURONS_QUERY = gql`query CandidateNeuronsQuery ($input: NeuronQueryInput, $includeInProgress: Boolean) {
    candidateNeurons(input: $input, includeInProgress: $includeInProgress) {
        totalCount
        offset
        items {
            ...NeuronFields
            reconstructions {
                ...ReconstructionFieldsFragment
            }
        }
    }
}
${NeuronFieldsFragment}
${ReconstructionFieldsFragment}
`;

export type NeuronsQueryVariables = {
    input: {
        offset?: number,
        limit?: number,
        specimenIds?: string[]
        atlasStructureIds?: string[]
        keywords?: string[]
        somaProperties?: SomaFilterProperties;
    },
    includeInProgress: boolean;
}

export type NeuronsQueryData = {
    totalCount: number;
    offset: number;
    items: NeuronShape[];
}

export type CandidateNeuronsResponse = {
    candidateNeurons: NeuronsQueryData;
}
