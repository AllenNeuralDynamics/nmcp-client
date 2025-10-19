import * as React from "react";
import {useQuery} from "@apollo/client";

import {COLLECTIONS_QUERY} from "../../graphql/collection";
import {SPECIMENS_QUERY, SamplesQueryResponse} from "../../graphql/specimen";
import {GENOTYPES_QUERY, GenotypesQueryResponse} from "../../graphql/genotype";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";

export const PolledData = () => {
    const {error: genotypesError} = useQuery<GenotypesQueryResponse>(GENOTYPES_QUERY, {pollInterval: 30000, fetchPolicy: "cache-and-network"});

    const {error: collectionsError} = useQuery<SamplesQueryResponse>(COLLECTIONS_QUERY, {pollInterval: 60000, fetchPolicy: "cache-and-network"});

    const {error: specimensError} = useQuery<SamplesQueryResponse>(SPECIMENS_QUERY, {pollInterval: 30000, fetchPolicy: "cache-and-network"});

    if (specimensError) {
        return <GraphQLErrorAlert title="Specimen Data Could Not Be Loaded" error={specimensError}/>;
    }

    if (collectionsError) {
        return <GraphQLErrorAlert title="Collection Data Could Not Be Loaded" error={collectionsError}/>;
    }

    if (genotypesError) {
        return <GraphQLErrorAlert title="Genotype Data Could Not Be Loaded" error={genotypesError}/>;
    }

    return null;
}
