import * as React from "react";
import {observer} from "mobx-react-lite";
import {Accordion, ActionIcon, Divider, Group, SimpleGrid, Stack, Text} from "@mantine/core";
import {IconChevronRight} from "@tabler/icons-react";

import {useAppLayout} from "../../../../hooks/useAppLayout";
import {DrawerState} from "../../../../viewmodel/appLayout";
import {StructureHistory} from "./StructureHistory";
import {AtlasTree} from "./AtlasTree";
import {NeuronListContainerWidth} from "../NeuronListContainer";
import {AtlasViewModel} from "../../../../viewmodel/atlasViewModel";
import {useAtlas} from "../../../../hooks/useAtlas";

const TreeAccordionKey = "tree";
const HistoryAccordionKey = "history";

export const AtlasContainer = observer(({maxHeight, atlasViewModel}: { maxHeight: number, atlasViewModel?: AtlasViewModel }) => {
    const appLayout = useAppLayout();

    const atlas = atlasViewModel ?? useAtlas();

    if (!atlas.initialized) {
        return null;
    }

    const renderedHeader = (
        <SimpleGrid p={8} cols={3} bg="section" style={{height: "40px"}}>
            <Group justify="start">
                <ActionIcon variant="subtle" onClick={() => appLayout.setAtlasStructureDrawerState(DrawerState.Hidden)}>
                    <IconChevronRight size={22}/>
                </ActionIcon>
            </Group>
            <Text ta="end">Atlas Structures</Text>
        </SimpleGrid>
    );

    const onAccordionChange = (values: string[]) => {
        appLayout.isAtlasStructureTreeExpanded = values.includes(TreeAccordionKey);
        appLayout.isAtlasStructureHistoryExpanded = values.includes(HistoryAccordionKey);
    }

    const defaultValue = [];

    if (appLayout.isAtlasStructureTreeExpanded) {
        defaultValue.push(TreeAccordionKey);
    }
    if (appLayout.isAtlasStructureHistoryExpanded) {
        defaultValue.push(HistoryAccordionKey);
    }

    return (
        <Stack gap={0} w={NeuronListContainerWidth} style={{height: maxHeight, maxHeight: maxHeight, order: 2}}>
            {renderedHeader}
            <Accordion multiple={true} defaultValue={defaultValue} onChange={onAccordionChange} style={{overflow: "auto"}}>
                <Accordion.Item value={HistoryAccordionKey}>
                    <Accordion.Control>History</Accordion.Control>
                    <Accordion.Panel styles={{content: {padding: 0}}}>
                        <Divider orientation="horizontal"/>
                        <StructureHistory atlas={atlas}/>
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value={TreeAccordionKey}>
                    <Accordion.Control>All Structures</Accordion.Control>
                    <Accordion.Panel styles={{content: {padding: 0}}}>
                        <Divider orientation="horizontal"/>
                        <AtlasTree atlas={atlas}/>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Stack>
    );
});
