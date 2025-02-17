import gql from "graphql-tag";

import {INeuron} from "../models/neuron";
import {ReconstructionFieldsFragment} from "./reconstruction";

export const NeuronFieldsFragment = gql`fragment NeuronFields on Neuron {
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
    sample {
        id
        animalId
    }
    brainArea {
        id
        name
    }
    reconstructions {
        ...ReconstructionFields
    }
}
${ReconstructionFieldsFragment}`;

export const CANDIDATE_NEURONS_QUERY = gql`query CandidateNeuronsQuery ($input: NeuronQueryInput, $includeInProgress: Boolean) {
    candidateNeurons(input: $input, includeInProgress: $includeInProgress) {
        totalCount
        items {
            ...NeuronFields
        }
    }
}
${NeuronFieldsFragment}`;

export type NeuronsQueryVariables = {
    input: {
        offset?: number,
        limit?: number,
        sortOrder?: string
        sampleIds?: string[]
        brainStructureIds?: string[]
        tag?: string
    },
    includeInProgress: boolean;
}

export type NeuronsQueryData = {
    totalCount: number;
    items: INeuron[];
}

export type CandidateNeuronsResponse = {
    candidateNeurons: NeuronsQueryData;
}

export const CANDIDATE_NEURONS_FOR_REVIEW_QUERY = gql`query CandidatesForReview {
    candidatesForReview {
        ...NeuronFields
    }
}
${NeuronFieldsFragment}`;

export type CandidateNeuronsForReviewQueryResponse = {
    candidatesForReview: INeuron[];
}
