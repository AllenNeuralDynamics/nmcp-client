import * as React from "react";
import {useQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Group, Loader, MultiSelect, Switch, Text} from "@mantine/core";

import {SPECIMENS_QUERY, SpecimensQueryResponse} from "../../../graphql/specimen";
import {OptionalFilter} from "../../../viewmodel/candidateFilter";
import {LoadingSpecimens, sortedSpecimenOptions} from "../SpecimenSelect";

export const SpecimenFilter = observer(({filter, w = null}: { filter: OptionalFilter<string[]>, w?: number }) => {
    const {loading, error, data} = useQuery<SpecimensQueryResponse>(SPECIMENS_QUERY, {fetchPolicy: "cache-first"});

    if (loading) {
        return <LoadingSpecimens/>;
    }

    const options = sortedSpecimenOptions(data?.specimens?.items);

    const props = w ? {w: w} : {miw: 200};

    const isError = error != null || options.length == 0;

    const placeholder = error ? "Specimens not found" : (options.length == 0 ? "No specimens defined" : null);

    return (
        <Group gap="sm" align="center" justify="stretch">
            <Switch label="Specimens" disabled={isError} checked={filter.isEnabled} onChange={(event) => filter.isEnabled = event.currentTarget.checked}/>

            <MultiSelect {...props} clearable placeholder={placeholder} data={options} value={filter.contents}
                         disabled={!filter.isEnabled} error={isError} onChange={(value) => filter.contents = value}/>
        </Group>
    );
});
