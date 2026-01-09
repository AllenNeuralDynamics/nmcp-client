import * as React from "react";
import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {ActionIcon, Divider, Group, Text, Tooltip} from "@mantine/core";
import {useThrottledCallback} from "@mantine/hooks";
import {IconAdjustmentsAlt, IconAlertTriangle, IconChartScatter3d, IconInfoCircle, IconRestore} from "@tabler/icons-react";

import {NeuroglancerViewer} from "../../viewer/neuroglancerViewer";
import {useAppLayout} from "../../hooks/useAppLayout";

export const NeuroglancerControls = observer(({viewer, allowResetView}: { viewer: NeuroglancerViewer, allowResetView: boolean }) => {
    const appLayout = useAppLayout();

    const [position, setPosition] = useState<number[]>([]);

    useEffect(() => {
        if (viewer) {
            viewer.PositionListener = positionChanged;
        }
    }, [viewer]);

    const resetNeuroglancerView = () => {
        viewer?.resetView();
    };

    const positionChanged = useThrottledCallback((p: number[]) => {
        setPosition(p.length == 0 ? [] : p);
    }, 50);

    const text = position.length > 0 ? `X ${position[0].toFixed(0)}   Y ${position[1].toFixed(0)}   Z ${position[2].toFixed(0)}` : "";

    const needWarning = appLayout.neuroglancerControlsVisible || appLayout.neuroglancerDimensionsVisible;

    return (
        <Group bg="section" p={8} justify="space-between" style={{flexGrow: 1}}>
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
                {needWarning ?
                    <Tooltip
                        label={<Group gap={4} align="center"><IconAlertTriangle size={14}/><Text size="sm">Modifying Neuroglancer layers and properties directly
                            may affect portal functionality.</Text></Group>}>
                        <IconInfoCircle size={18} color="var(--mantine-color-warning-5)"/>
                    </Tooltip> : null}
                {allowResetView ?
                    <Divider orientation="vertical"/> : null}
                {allowResetView ?
                    <Tooltip label="Reset the view scale and orientation">
                        <ActionIcon variant="subtle" onClick={resetNeuroglancerView}>
                            <IconRestore size={18}/>
                        </ActionIcon>
                    </Tooltip> : null}
            </Group>
            <Text size="xs" c="dimmed">{text}</Text>
        </Group>
    );
});
