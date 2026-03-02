import * as React from "react";
import {useQuery} from "@apollo/client";
import {ComboboxData, Group, Loader, MultiSelect, Switch, Text} from "@mantine/core";

import {CollectionShape} from "../../models/collection";
import {COLLECTIONS_QUERY, CollectionsResponse} from "../../graphql/collection";

export const LoadingCollections = () => {
    return <Group gap="sm" align="center">
        <Text size="sm" c="dimmed">Loading collections</Text>
        <Loader color="blue" type="bars" size={22}/>
    </Group>
}

export function sortedCollectionOptions(specimens: CollectionShape[]): ComboboxData {
    return specimens ? specimens.map(s => {
        return {label: s.name, value: s.id}
    }) : [];
}

type CollectionsSelectProps = {
    values: string[];
    limitCollections: boolean;

    onChange?(values: string[]): void;
    onChangeSelectAll(b: boolean): void;
}

export const CollectionsSelect = ({values, limitCollections, onChange, onChangeSelectAll}: CollectionsSelectProps) => {
    const {loading, error, data} = useQuery<CollectionsResponse>(COLLECTIONS_QUERY, {fetchPolicy: "cache-first"});

    if (loading) {
        return <LoadingCollections/>;
    }

    let options = sortedCollectionOptions(data?.collections);

    const isError = error != null || options.length == 0;

    const placeholder = error ? "Collections not found" : (options.length == 0 ? "No collections defined" : null);

    return (
        <Group>
            <Switch label="Limit Collections" checked={limitCollections} onChange={(e) => onChangeSelectAll(e.currentTarget.checked)}></Switch>
            <MultiSelect w={300} disabled={isError || !limitCollections} placeholder={placeholder} data={options} value={values} error={isError} onChange={onChange}
                         rightSectionPointerEvents="auto"/>
        </Group>
    );
};
