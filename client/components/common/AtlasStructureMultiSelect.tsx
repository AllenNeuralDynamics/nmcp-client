import * as React from "react";
import {useMemo} from "react";
import {observer} from "mobx-react-lite";
import {ComboboxItem, MultiSelect, OptionsFilter} from "@mantine/core";

import {useConstants} from "../../hooks/useConstants";
import {formatAtlasStructure, AtlasStructureShape} from "../../models/atlasStructure";

export type AtlasStructureMultiSelectProps = {
    atlasId: string;
    label?: string;
    disabled?: boolean;
    selection: AtlasStructureShape[];
    w?: number;

    onSelectionChange(selection: AtlasStructureShape[]): void;
}

export const AtlasStructureMultiSelect = observer<AtlasStructureMultiSelectProps>(({atlasId, selection, disabled, label, w, onSelectionChange}) => {
    const constants = useConstants();

    const atlas = constants.getAtlas(atlasId);

    const atlasOptions = useMemo(() => atlas?.Structures.map(s => ({value: s.id, label: formatAtlasStructure(s)})) ?? [], [atlas]);

    // A restored predicate may hold structures of another atlas. They need an option so Mantine labels their pills
    // instead of showing the raw id, but they are never offered as new choices (see optionsFilter).
    const foreignOptions = selection.filter(s => s.atlasId !== atlas?.id).map(s => ({
        value: s.id,
        label: `${formatAtlasStructure(s)} (${constants.getAtlas(s.atlasId)?.name})`
    }));

    function onChangeSelection(data: string[]) {
        onSelectionChange(data.map(id => constants.findAtlasStructure(id)).filter(s => s != null));
    }

    // Membership comes first: structureMatchesText dereferences the structure it looks up, which throws for a
    // structure of another atlas.
    const optionsFilter: OptionsFilter = ({options, search}) => {
        return (options as ComboboxItem[]).filter((option) => {
            return atlas?.findStructureWithId(option.value) != null && atlas.structureMatchesText(search, option.value);
        });
    };

    const value = selection.map(s => s.id);

    const props = w ? {w: w} :{};

    return (
        <MultiSelect {...props} label={label ?? null} data={[...atlasOptions, ...foreignOptions]} value={value} onChange={onChangeSelection} disabled={disabled}
                     clearable searchable filter={optionsFilter}/>
    );
});
