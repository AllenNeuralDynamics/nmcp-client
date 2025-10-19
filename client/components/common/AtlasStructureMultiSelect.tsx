import * as React from "react";
import {useRef} from "react";
import {observer} from "mobx-react-lite";
import {ComboboxItem, MultiSelect, OptionsFilter} from "@mantine/core";

import {useConstants} from "../../hooks/useConstants";
import {formatAtlasStructure, AtlasStructureShape} from "../../models/atlasStructure";

export type AtlasStructureMultiSelectProps = {
    label?: string;
    disabled?: boolean;
    selection: AtlasStructureShape[];
    w?: number;

    onSelectionChange(selection: AtlasStructureShape[]): void;
}

export const AtlasStructureMultiSelect = observer<AtlasStructureMultiSelectProps>(({selection, disabled, label, w, onSelectionChange}) => {
    let optionMap = useRef<Map<string, ComboboxItem>>(new Map());

    const constants = useConstants().AtlasConstants;

    if (optionMap.current.size == 0) {
        constants.Structures.forEach(s => {
            optionMap.current.set(s.id, {value: s.id, label: formatAtlasStructure(s)})
        });
    }

    function onChangeSelection(data: string[]) {
        onSelectionChange(constants.findStructures(data))
    }

    const optionsFilter: OptionsFilter = ({options, search}) => {
        return (options as ComboboxItem[]).filter((option) => {
            return constants.structureMatchesText(search, option.value);
        });
    };

    const options = Array.from(optionMap.current.values())

    const value = selection.map(s => optionMap.current.get(s.id).value);

    const props = w ? {w: w} :{};

    return (
        <MultiSelect {...props} label={label ?? null} data={options} value={value} onChange={onChangeSelection} disabled={disabled} clearable searchable
                     filter={optionsFilter}/>
    );
});

