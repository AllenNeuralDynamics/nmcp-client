import * as React from "react";
import {ActionIcon, getTreeExpandedState, Group, Text, Tree, TreeNodeData, useTree} from '@mantine/core';
import {IconChevronDown, IconChevronRight} from "@tabler/icons-react";

import {AtlasStructureViewModel} from "../../../../viewmodel/atlasStructureViewModel";
import {useAtlas} from "../../../../hooks/useAtlas";
import {AtlasViewModel} from "../../../../viewmodel/atlasViewModel";
import {isSelectedIcon} from "../NeuronTable";
import {observer} from "mobx-react-lite";

interface StructureTreeNodeData extends TreeNodeData {
    structure: AtlasStructureViewModel;
}

function generateTree(root: AtlasStructureViewModel): StructureTreeNodeData {
    const children = root.children.map(c => generateTree(c));

    return {
        label: root.structure.name,
        value: root.structure.id,
        structure: root,
        children: children
    }
}

let staticTree = [];

function getTree(atlas: AtlasViewModel): StructureTreeNodeData[] {
    if (staticTree.length == 0) {
        staticTree = [generateTree(atlas.rootStructure)]
    }

    return staticTree;
}

export const StructureTree = observer(() => {
    const atlas = useAtlas();

    const data = getTree(atlas);

    const onClick =(evt: any, n: StructureTreeNodeData) => {
        evt.stopPropagation();
        atlas.toggle(n.structure.structure.id);
    }

    const tree = useTree({
        initialExpandedState: getTreeExpandedState(data, [atlas.rootStructure.structure.id]),
    });

    return (
        <Tree tree={tree} data={data} levelOffset={23}
              renderNode={({node, expanded, hasChildren, elementProps}) => {
                  const n = node as StructureTreeNodeData;
                  return (
                      <Group gap={4} {...elementProps}>
                          {hasChildren && (
                              <IconChevronRight
                                  size={18}
                                  style={{transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)'}}
                              />
                          )}
                          <Group gap={0}>
                              <ActionIcon variant="transparent" onClick={(e) => onClick(e, n)}>
                                  {isSelectedIcon(n.structure.isDisplayed)}
                              </ActionIcon>
                              <Text size="sm" lineClamp={1} truncate="end" onClick={(e) => onClick(e, n)}>{n.structure.structure.name}</Text>
                          </Group>
                      </Group>
                  )
              }}
        />
    );
});
