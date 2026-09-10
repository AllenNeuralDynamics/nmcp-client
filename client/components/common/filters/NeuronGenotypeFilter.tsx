import * as React from "react";
import {useQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Group, MultiSelect, Switch} from "@mantine/core";

import {GENOTYPES_QUERY, GenotypesQueryResponse} from "../../../graphql/genotype";
import {OptionalFilter} from "../../../viewmodel/candidateFilter";
import {LoadingGenotypes, sortedGenotypeOptions} from "../GenotypeAutosuggset";

export const NeuronGenotypeFilter = observer(({filter, w = null}: { filter: OptionalFilter<string[]>, w?: number }) => {
    const {loading, error, data} = useQuery<GenotypesQueryResponse>(GENOTYPES_QUERY, {fetchPolicy: "cache-first"});

    if (loading) {
        return <LoadingGenotypes/>;
    }

    const options = sortedGenotypeOptions(data?.genotypes);

    const props = w ? {w: w} : {miw: 200};

    const isError = error != null || options.length == 0;

    const placeholder = error ? "Genotypes not found" : (options.length == 0 ? "No genotypes defined" : null);

    return (
        <Group gap="sm" align="center" justify="stretch">
            <Switch label="Genotype" disabled={isError} checked={filter.isEnabled} onChange={(event) => filter.isEnabled = event.currentTarget.checked}/>

            <MultiSelect {...props} clearable placeholder={placeholder} data={options} value={filter.contents}
                         disabled={!filter.isEnabled} error={isError} onChange={(value) => filter.contents = value}/>
        </Group>
    );
});
