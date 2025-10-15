import * as React from "react";
import {List, Icon} from "semantic-ui-react";
import {Text} from "@mantine/core"

import {AtlasStructureViewModel} from "../../../../viewmodel/atlasStructureViewModel";
import {observer} from "mobx-react";
import {useAtlas} from "../../../../hooks/useAtlas";

type StructureHistoryRowProps = {
    structure: AtlasStructureViewModel;
}

const StructureHistoryRow = observer((props: StructureHistoryRowProps) => {
    const v = props.structure;

    return (
        <List.Item style={{paddingLeft: "12px"}}>
            <List.Content floated="right">
                {v.isDisplayed ? null :
                    <Icon name="remove" color="red" onClick={() => v.shouldIncludeInHistory = false}/>
                }
            </List.Content>
            <List.Icon name={v.isDisplayed ? "check square outline" : "square outline"} onClick={() => v.isDisplayed = !v.isDisplayed}/>
            <List.Content onClick={() => () => v.isDisplayed = !v.isDisplayed}>
                {v.structure.name}
            </List.Content>
        </List.Item>
    )
});

export const StructureHistory = observer(() => {
    const atlas = useAtlas();

    const rows: any = atlas.structureHistory.map(v => {
        return (<StructureHistoryRow key={`bv_${v.structure.id}`} structure={v}/>)
    });

    if (rows.length === 0) {
        return (<Text size="sm" fs="italic" c="gray.8" p="8">History will appear as additional brain structures are displayed</Text>);
    }

    return (
        <List divided relaxed style={{margin: 0, paddingTop: "6px", paddingBottom: "6px"}}>
            {rows}
        </List>
    );
});
