import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {ActionIcon, Divider, Flex, Group, Stack, Text, Tooltip} from "@mantine/core";
import {IconAdjustmentsAlt, IconChartScatter3d, IconChevronLeft, IconChevronRight, IconRestore} from "@tabler/icons-react";

import {NeuroglancerProxy} from "../../../viewer/neuroglancerProxy";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {DrawerState} from "../../../viewmodel/appLayout";
import {ReconstructionViewer} from "./ReconstructionViewer";
import {useThrottledCallback} from "@mantine/hooks";

export const ViewerContainer = observer(({maxHeight}: { maxHeight: number }) => {
    const appLayout = useAppLayout();

    const [x, setX] = useState<number[]>([]);

    const renderNeuronOpen = () => {
        if (appLayout.neuronDrawerState == DrawerState.Hidden) {
            return (
                <Group p={8} gap={0} align="center">
                    <Text>Neurons</Text>
                    <ActionIcon variant="subtle" onClick={() => appLayout.setNeuronDrawerState(DrawerState.Dock)}>
                        <IconChevronRight size={22}/>
                    </ActionIcon>
                    <Divider orientation="vertical"/>
                </Group>
            );
        } else {
            return <Divider orientation="vertical"/>;
        }
    };

    const renderAtlasStructureOpen = () => {
        if (appLayout.atlasStructureDrawerState == DrawerState.Hidden) {
            return (
                <Group p={8} gap={0} justify="end" align="center">
                    <Divider orientation="vertical"/>
                    <ActionIcon variant="subtle" onClick={() => appLayout.setAtlasStructureDrawerState(DrawerState.Dock)}>
                        <IconChevronLeft size={22}/>
                    </ActionIcon>
                    <Text>Atlas Structures</Text>
                </Group>
            );
        } else {
            return <Group p={0} gap={0}><Divider orientation="vertical"/></Group>;
        }
    };

    const resetNeuroglancerView = () => {
        NeuroglancerProxy.SearchNeuroglancer?.resetView()
    };

    const renderControls = () => {
        const text = x.length > 0 ? `X ${x[0].toFixed(0)}   Y ${x[1].toFixed(0)}   Z ${x[2].toFixed(0)}` : "";

        return (
            <Group p={8} justify="space-between" style={{flexGrow: 1}}>
                <Group>
                    <Tooltip label="Show or hide Neuroglancer controls">
                        <ActionIcon variant="subtle" onClick={() => appLayout.toggleNeuroglancerControlsVisible()}>
                            <IconAdjustmentsAlt size={18}/>
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Show or hide Neuroglancer dimensions overlay">
                        <ActionIcon variant="subtle" onClick={() => appLayout.toggleNeuroglancerDimensionsVisible()}>
                            <IconChartScatter3d size={18}/>
                        </ActionIcon>
                    </Tooltip>
                    <Divider orientation="vertical"/>
                    <Tooltip label="Reset the view scale and orientation">
                        <ActionIcon variant="subtle" onClick={resetNeuroglancerView}>
                            <IconRestore size={18}/>
                        </ActionIcon>
                    </Tooltip>
                </Group>
                <Text size="xs" c="dimmed">{text}</Text>
            </Group>
        );
    }

    const renderedHeader = (
        <Flex p={0} bg="section" style={{height: "40px"}}>
            {renderNeuronOpen()}
            {renderControls()}
            {renderAtlasStructureOpen()}
        </Flex>
    );


    const positionChanged = useThrottledCallback((p: number[]) => {
        if (p.length == 0) {
            setX([]);
        } else {
            setX(p);
        }

    }, 50);

    return (
        <Stack gap={0} style={{flexGrow: 1, height: maxHeight, maxHeight: maxHeight, position: "relative"}}>
            {renderedHeader}
            <Divider orientation="horizontal"/>
            <ReconstructionViewer height={maxHeight - 40} positionChanged={positionChanged}/>
        </Stack>
    );
});
