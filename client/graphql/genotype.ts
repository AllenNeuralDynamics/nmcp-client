import gql from "graphql-tag";

import {GenotypeShape} from "../models/genotype";

export const GENOTYPE_FIELDS_FRAGMENT = gql`fragment GenotypeFields on Genotype {
    id
    name
}`;

//
// All genotypes query.
//
export const GENOTYPES_QUERY = gql`query GenotypesQuery {
    genotypes {
        ...GenotypeFields
    }
}
${GENOTYPE_FIELDS_FRAGMENT}
`;

export type GenotypesQueryResponse = {
    genotypes: GenotypeShape[]
}
