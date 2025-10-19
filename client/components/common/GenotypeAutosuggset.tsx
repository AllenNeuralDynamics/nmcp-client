import * as React from "react";
import {useQuery} from "@apollo/client";
import {ComboboxData, Group, Loader, Text} from "@mantine/core";

import {GenotypeShape} from "../../models/genotype";
import {GENOTYPES_QUERY, GenotypesQueryResponse} from "../../graphql/genotype";
import {Autosuggest, AutosuggestData} from "./Autosuggest";

export const LoadingGenotypes = () => {
    return <Group gap="sm" align="center">
        <Text size="sm" c="dimmed">Loading genotypes</Text>
        <Loader color="blue" type="bars" size={22}/>
    </Group>
}

export function sortedCollectionOptions(genotypes: GenotypeShape[]): AutosuggestData[] {
    return genotypes ? genotypes.slice().sort((s1, s2) => s1.name < s2.name ? -1 : 1).map(s => {
        return {name: s.name, id: s.id}
    }) : [];
}

type GenotypeAutosuggestProps = {
    value: string;
    onChange?(value: string): void;
}

export const GenotypeAutosuggest = ({value, onChange}: GenotypeAutosuggestProps) => {
    const {loading, error, data} = useQuery<GenotypesQueryResponse>(GENOTYPES_QUERY, {fetchPolicy: "cache-first"});

    if (loading) {
        return <LoadingGenotypes/>;
    }

    const options = sortedCollectionOptions(data?.genotypes);

    const isError = error != null

    const placeholder = error ? "Genotypes not found" : (value?.length > 0 ? null : "Select or name a genotype...");

    return <Autosuggest disabled={isError} placeholder={placeholder} data={options} value={value} onChange={onChange}/>;
};
