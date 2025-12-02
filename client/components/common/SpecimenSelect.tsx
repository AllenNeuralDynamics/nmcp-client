import * as React from "react";
import {useQuery} from "@apollo/client";
import {ComboboxData, Group, Loader, Select, Text} from "@mantine/core";

import {SPECIMENS_QUERY, SpecimensQueryResponse} from "../../graphql/specimen";
import {SpecimenShape} from "../../models/specimen";
import {IconLock, IconLockOpen} from "@tabler/icons-react";

export const LoadingSpecimens = () => {
    return <Group gap="sm" align="center">
        <Text size="sm" c="dimmed">Loading specimens</Text>
        <Loader color="blue" type="bars" size={22}/>
    </Group>
}

export function sortedSpecimenOptions(specimens: SpecimenShape[]): ComboboxData {
    return specimens ? specimens.slice().sort((s1, s2) => s1.label < s2.label ? -1 : 1).map(s => {
        return {label: s.label, value: s.id}
    }) : [];
}

type SpecimenSelectProps = {
    value: string;
    clearable?: boolean;
    lockable?: boolean;
    locked?: boolean;

    onChange?: (value: string) => void;
    onLock?: (b: boolean) => void;
}

export const SpecimenSelect = ({value, clearable, lockable, locked, onChange, onLock}: SpecimenSelectProps) => {
    const {loading, error, data} = useQuery<SpecimensQueryResponse>(SPECIMENS_QUERY, {fetchPolicy: "cache-first"});

    if (loading) {
        return <LoadingSpecimens/>;
    }

    const options = sortedSpecimenOptions(data?.specimens?.items);

    const isError = error != null || options.length == 0;

    const placeholder = error ? "Specimens not found" : (options.length == 0 ? "No specimens defined" : null);

    const disabled = (lockable && locked) || isError;

    const pointerEffects = isError ? "none" : "auto";

    const icon = locked ? <IconLock color="red" onClick={() => onLock(!locked)}/> : <IconLockOpen color="green" onClick={() => onLock(!locked)}/>;

    const rightSection = lockable ? icon : null;

    return <Select clearable={clearable} allowDeselect={clearable || false} disabled={disabled} placeholder={placeholder} rightSection={rightSection}
                   rightSectionPointerEvents={pointerEffects} data={options} value={value} error={isError}
                   onChange={onChange}/>;
};
