import * as React from "react";
import {useQuery} from "@apollo/client";
import {ComboboxData, Group, Loader, Select, Text} from "@mantine/core";

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

type CollectionSelectProps = {
    value: string;
    defaultSelection?: boolean;

    onChange?(value: string): void;
}

export const CollectionSelect = ({value, defaultSelection, onChange}: CollectionSelectProps) => {
    const {loading, error, data} = useQuery<CollectionsResponse>(COLLECTIONS_QUERY, {fetchPolicy: "cache-first"});

    if (loading) {
        return <LoadingCollections/>;
    }

    const options = sortedCollectionOptions(data?.collections);

    const isError = error != null || options.length == 0;

    const placeholder = error ? "Collections not found" : (options.length == 0 ? "No collections defined" : null);

    if (defaultSelection && !value && data?.collections.length > 0) {
        onChange(data.collections[0].id);
    }

    return <Select disabled={isError} allowDeselect={false} placeholder={placeholder} data={options} value={value} error={isError} onChange={onChange}
                   rightSectionPointerEvents="auto"/>;
};
