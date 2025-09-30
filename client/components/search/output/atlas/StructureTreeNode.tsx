import * as React from "react";
import {observer} from "mobx-react";
import {Icon, List} from "semantic-ui-react";

import {AtlasStructureViewModel} from "../../../../viewmodel/atlasStructureViewModel";
import {useAtlas} from "../../../../hooks/useAtlas";

type StructureTreeNodeProps = {
    structure: AtlasStructureViewModel;
    structureOnly: boolean;
}

export const StructureTreeNode = observer<React.FC<StructureTreeNodeProps>>(({structure, structureOnly}) => {
    const atlas = useAtlas();

    const isParent = !structureOnly && structure.children?.length > 0;

    const iconName = isParent ? (structure.shouldShowChildren ? "folder open" : "folder") : "file";

    const items = (isParent && structure.shouldShowChildren) ? (
        <List.List>
            {structure.children.map(s => (
                <StructureTreeNode key={s.structure.id} structure={s} structureOnly={structureOnly}/>
            ))}
        </List.List>
    ) : null;

    return (
        <List.Item>
            <List.Icon name={iconName} onClick={() => structure.shouldShowChildren = !structure.shouldShowChildren}/>
            <List.Content>
                <List.Description onClick={() => atlas.toggle(structure.structure.id)}>
                    <Icon name={structure.isDisplayed ? "check square outline" : "square outline"}/>
                    {structure.structure.name}
                </List.Description>
                {items}
            </List.Content>
        </List.Item>
    );
});
