import * as React from "react";
import {List, Icon} from "semantic-ui-react";

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

    return (
        <List divided relaxed style={{margin: 0, paddingTop: "6px", paddingBottom: "6px"}}>
            {rows}
        </List>
    );
});
