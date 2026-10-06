import * as React from "react";
import {useMemo, useState} from "react";
import {ComboboxItem, OptionsFilter, Select} from "@mantine/core";

import {useConstants} from "../../hooks/useConstants";
import {formatAtlasStructure, AtlasStructureShape} from "../../models/atlasStructure";

type AtlasStructureSelectProps = {
    atlasId: string;
    value: AtlasStructureShape;
    label?: string;
    clearable?: boolean;

    onChange(value: AtlasStructureShape): void;
}

export const AtlasStructureSelect = ({atlasId, value, label, clearable, onChange}: AtlasStructureSelectProps) => {
    const [localValue, setLocalValue] = useState<string>(value?.id);

    const atlas = useConstants().getAtlas(atlasId);

    const options = useMemo(() => atlas?.Structures.map(s => ({value: s.id, label: formatAtlasStructure(s)})) ?? [], [atlas]);

    const optionsFilter: OptionsFilter = ({options, search}) => {
        return (options as ComboboxItem[]).filter((option) => {
            return atlas?.structureMatchesText(search, option.value);
        });
    };

    const onChangeLocal = (v: string) => {
        setLocalValue(v);
        onChange(atlas?.findStructureWithId(v));
    }

    return (
        <Select label={label ?? null} data={options} value={localValue} onChange={onChangeLocal} allowDeselect={false} clearable={clearable} searchable filter={optionsFilter}/>
    );
}
