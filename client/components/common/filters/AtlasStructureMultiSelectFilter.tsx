import * as React from "react";
import {observer} from "mobx-react-lite";
import {Group, Switch} from "@mantine/core";

import {AtlasStructureMultiSelect} from "../AtlasStructureMultiSelect";
import {AtlasStructureShape} from "../../../models/atlasStructure";
import {OptionalFilter} from "../../../viewmodel/candidateFilter";

export const AtlasStructureMultiSelectFilter = observer(({filter, w}: { filter: OptionalFilter<AtlasStructureShape[]>, w: number }) => {
    const props = w ? {w: w} :{};

    return (
        <Group gap="sm" align="center">
            <Switch key="atlas-structure-filter" label="Atlas structures" checked={filter.isEnabled} onChange={(event) => filter.isEnabled = event.currentTarget.checked}/>
            <AtlasStructureMultiSelect {...props} selection={filter.contents} disabled={!filter.isEnabled} onSelectionChange={(value) => filter.contents = value}/>
        </Group>
    );
});
