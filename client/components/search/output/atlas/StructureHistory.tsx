import * as React from "react";
import {ActionIcon, Group, Stack, Text} from "@mantine/core"

import {AtlasStructureViewModel} from "../../../../viewmodel/atlasStructureViewModel";
import {observer} from "mobx-react-lite";
import {isSelectedIcon} from "../NeuronTable";
import {IconX} from "@tabler/icons-react";
import {AtlasViewModel} from "../../../../viewmodel/atlasViewModel";

type StructureHistoryRowProps = {
    structure: AtlasStructureViewModel;
}

const StructureHistoryRow = observer((props: StructureHistoryRowProps) => {
    const v = props.structure;

    return (
        <Group justify="space-between" fz={15}>
            <Group>
                <ActionIcon variant="transparent" onClick={() => v.isDisplayed = !v.isDisplayed}>
                    {isSelectedIcon(v.isDisplayed)}
                </ActionIcon>
                {v.structure.name}
            </Group>
            {v.isDisplayed ? null :
                <ActionIcon size={28} variant="transparent" onClick={() => v.shouldIncludeInHistory = false}>
                    <IconX size={14}/>
                </ActionIcon>}
        </Group>
    )
});

export const StructureHistory = observer(({atlas}: {atlas: AtlasViewModel}) => {
    const rows: any = atlas.structureHistory.map(v => {
        return (<StructureHistoryRow key={`bv_${v.structure.id}`} structure={v}/>)
    });

    if (rows.length === 0) {
        return (<Text size="sm" fs="italic" c="dimmed" p="8">History will appear as additional atlas structures are displayed</Text>);
    }

    return (
        <Stack gap={0} p={4}>
            {rows}
        </Stack>
    );
});
