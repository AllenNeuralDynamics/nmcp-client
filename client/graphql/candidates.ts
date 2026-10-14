import gql from "graphql-tag";

import {NeuronShape, SomaFilterProperties} from "../models/neuron";
import {ReconstructionStatus} from "../models/reconstructionStatus";
import {NEURON_BASE_FIELDS_FRAGMENT, NEURON_RELATIONSHIP_FIELDS_FRAGMENT} from "./neuron";
import {ReconstructionFieldsFragment} from "./reconstruction";


export const NeuronFieldsFragment = gql`fragment NeuronFields on Neuron {
    ...NeuronBaseFields
    ...NeuronRelationshipFields
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}`;

export const CANDIDATE_NEURONS_QUERY = gql`query CandidateNeuronsQuery ($input: NeuronQueryInput, $includeInProgress: Boolean, $excludedReconstructionStatuses: [Int!]) {
    candidateNeurons(input: $input, includeInProgress: $includeInProgress, excludedReconstructionStatuses: $excludedReconstructionStatuses) {
        totalCount
        offset
        items {
            ...NeuronFields
            untraceable
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
        genotype?: string[]
        somaProperties?: SomaFilterProperties;
    },
    includeInProgress: boolean;
    excludedReconstructionStatuses?: ReconstructionStatus[];
}

export type NeuronsQueryData = {
    totalCount: number;
    offset: number;
    items: NeuronShape[];
}

export type CandidateNeuronsResponse = {
    candidateNeurons: NeuronsQueryData;
}
