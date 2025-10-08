import * as React from "react";
import {useEffect, useRef} from "react";
import {ComboboxItem, MultiSelect, OptionsFilter} from "@mantine/core";

import {displayBrainArea, IBrainArea} from "../../models/brainArea";
import {useConstants} from "../../hooks/useConstants";

class AtlasStructureOption {
    public label: string;
    public value: string;
    public data: IBrainArea;

    public constructor(structure: IBrainArea) {
        this.label = displayBrainArea(structure);
        this.value = structure.id;
        this.data = structure;
    }
}

export type AtlasStructureMultiSelectProps = {
    selection: IBrainArea[];
    disabled?: boolean;

    onSelectionChange(selection: IBrainArea[]): void;
}

export const AtlasStructureMultiselect: React.FC<AtlasStructureMultiSelectProps> = ({selection, disabled, onSelectionChange}) => {
    let optionMap = useRef<Map<string, ComboboxItem>>(null);

    const constants = useConstants();

    useEffect(() => {
        if (!optionMap.current) {
            optionMap.current = new Map();
            constants.BrainAreas.sort((s1, s2) => displayBrainArea(s1).localeCompare(displayBrainArea(s2))).forEach(s => {
                optionMap.current.set(s.id, {value: s.id, label: displayBrainArea(s)})
            });
        }
    }, []);

    if (!optionMap.current) {
        return (<div/>);
    }

    function onChangeSelection(data: string[]) {
        onSelectionChange(constants.findAtlasStructures(data))
    }

    const optionsFilter: OptionsFilter = ({options, search}) => {
        return (options as ComboboxItem[]).filter((option) => {
            return filterBrainArea(constants.findBrainArea(option.value), search);
        });
    };

    const options = Array.from(optionMap.current.values())

    const value = selection.map(s => optionMap.current.get(s.id).value);

    return (
        <MultiSelect data={options} value={value} onChange={onChangeSelection} disabled={disabled} clearable searchable filter={optionsFilter}/>
    );
}

function filterBrainArea(compartment: IBrainArea, value: string) {
    if (!value) {
        return true;
    }

    const filterValue = value.toLowerCase();

    if (compartment.name.toLowerCase().includes(filterValue)) {
        return true;
    }

    if (compartment.acronym.toLowerCase().includes(filterValue)) {
        return true;
    }

    const matches = compartment.aliasList?.some(a => a.toLowerCase().includes(filterValue));

    if (matches) {
        return true;
    }

    const parts = filterValue.split(/\s+/);

    if (parts.length < 2) {
        return false;
    }

    const itemParts = compartment.name.split(/\s+/);

    return parts.some(p => {
        return itemParts.some(i => i === p);
    });
}
