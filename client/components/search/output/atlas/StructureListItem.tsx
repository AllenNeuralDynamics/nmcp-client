import * as React from "react";
import {observer} from "mobx-react-lite";
import {ActionIcon, List, Text} from "@mantine/core";

import {AtlasStructureViewModel} from "../../../../viewmodel/atlasStructureViewModel";
import {useAtlas} from "../../../../hooks/useAtlas";
import {isSelectedIcon} from "../NeuronTable";

export const StructureListItem = observer(({structure}: { structure: AtlasStructureViewModel }) => {
    const atlas = useAtlas();

    return (
        <List.Item icon={
            <ActionIcon variant="transparent" onClick={() => atlas.toggle(structure.structure.id)}>
                {isSelectedIcon(structure.isDisplayed)}
            </ActionIcon>
        }>
            <Text size="sm" lineClamp={1} truncate="end">{structure.structure.name}</Text>
        </List.Item>
    );
});
