import * as React from "react";
import {useRef, useState} from "react";
import {ComboboxItem, OptionsFilter, Select} from "@mantine/core";

import {useConstants} from "../../hooks/useConstants";
import {formatAtlasStructure, AtlasStructureShape} from "../../models/atlasStructure";

type AtlasStructureSelectProps = {
    value: AtlasStructureShape;
    label?: string;
    clearable?: boolean;

    onChange(value: AtlasStructureShape): void;
}

export const AtlasStructureSelect = ({value, label, clearable, onChange}: AtlasStructureSelectProps) => {
    let optionMap = useRef<Map<string, ComboboxItem>>(new Map());

    const [localValue, setLocalValue] = useState<string>(value?.id);

    const constants = useConstants().AtlasConstants;

    if (optionMap.current.size == 0) {
        constants.Structures.forEach(s => {
            optionMap.current.set(s.id, {value: s.id, label: formatAtlasStructure(s)})
        });
    }

    const optionsFilter: OptionsFilter = ({options, search}) => {
        return (options as ComboboxItem[]).filter((option) => {
            return constants.structureMatchesText(search, option.value);
        });
    };

    const onChangeLocal = (v: string) => {
        setLocalValue(v);
        onChange(constants.findStructureWithId(v));
    }

    const options = Array.from(optionMap.current.values());

    return (
        <Select label={label ?? null} data={options} value={localValue} onChange={onChangeLocal} allowDeselect={false} clearable={clearable} searchable filter={optionsFilter}/>
    );
}
