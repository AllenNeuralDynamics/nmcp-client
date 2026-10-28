import gql from "graphql-tag";

import {NeuronShape, SomaFilterProperties} from "../models/neuron";
import {AnnotationStatus} from "../models/annotationStatus";
import {NEURON_BASE_FIELDS_FRAGMENT, NEURON_RELATIONSHIP_FIELDS_FRAGMENT} from "./neuron";
import {AnnotationFieldsFragment} from "./annotation";


export const NeuronFieldsFragment = gql`fragment NeuronFields on Neuron {
    ...NeuronBaseFields
    ...NeuronRelationshipFields
}
${NEURON_BASE_FIELDS_FRAGMENT}
${NEURON_RELATIONSHIP_FIELDS_FRAGMENT}`;

export const CANDIDATE_NEURONS_QUERY = gql`query CandidateNeuronsQuery ($input: NeuronQueryInput, $includeInProgress: Boolean, $excludedAnnotationStatuses: [Int!]) {
    candidateNeurons(input: $input, includeInProgress: $includeInProgress, excludedAnnotationStatuses: $excludedAnnotationStatuses) {
        totalCount
        offset
        items {
            ...NeuronFields
            untraceable
            annotations {
                ...AnnotationFieldsFragment
            }
        }
    }
}
${NeuronFieldsFragment}
${AnnotationFieldsFragment}
`;

export const CANDIDATE_NEURON_LOCATIONS_QUERY = gql`query CandidateNeuronLocationsQuery ($input: NeuronQueryInput, $includeInProgress: Boolean, $excludedAnnotationStatuses: [Int!], $after: String) {
    candidateNeuronLocations(input: $input, includeInProgress: $includeInProgress, excludedAnnotationStatuses: $excludedAnnotationStatuses, after: $after) {
        ids
        locations
        nextCursor
        totalCount
    }
}`;

export const CANDIDATE_NEURON_OFFSET_QUERY = gql`query CandidateNeuronOffsetQuery ($id: String!, $input: NeuronQueryInput, $includeInProgress: Boolean, $excludedAnnotationStatuses: [Int!]) {
    candidateNeuronOffset(id: $id, input: $input, includeInProgress: $includeInProgress, excludedAnnotationStatuses: $excludedAnnotationStatuses)
}`;

export type CandidateFilterInput = {
    specimenIds?: string[];
    atlasStructureIds?: string[];
    keywords?: string[];
    genotype?: string[];
    somaProperties?: SomaFilterProperties;
}

export type CandidateQueryVariables = {
    input: CandidateFilterInput;
    includeInProgress: boolean;
    excludedAnnotationStatuses?: AnnotationStatus[];
}

export type CandidateNeuronsQueryVariables = Omit<CandidateQueryVariables, "input"> & {
    input: CandidateFilterInput & { offset: number; limit: number };
}

export type NeuronsQueryData = {
    totalCount: number;
    offset: number;
    items: NeuronShape[];
}

export type CandidateNeuronsResponse = {
    candidateNeurons: NeuronsQueryData;
}

// Parallel arrays: locations[i] is ids[i]'s atlas soma as [x, y, z] in microns, or null.
export type CandidateNeuronLocations = {
    ids: string[];
    locations: (number[] | null)[];
    nextCursor: string | null;
    totalCount: number | null;
}

export type CandidateNeuronLocationsResponse = {
    candidateNeuronLocations: CandidateNeuronLocations;
}

export type CandidateNeuronLocationsVariables = CandidateQueryVariables & {
    after: string | null;
}

export type CandidateNeuronOffsetResponse = {
    candidateNeuronOffset: number | null;
}

export type CandidateNeuronOffsetVariables = CandidateQueryVariables & {
    id: string;
}
