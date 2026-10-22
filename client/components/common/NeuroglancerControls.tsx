import * as React from "react";
import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {ActionIcon, Divider, Group, Text, Tooltip} from "@mantine/core";
import {useThrottledCallback} from "@mantine/hooks";
import {IconAdjustmentsAlt, IconAlertTriangle, IconChartScatter3d, IconCopy, IconExternalLink, IconInfoCircle, IconRestore} from "@tabler/icons-react";

import {NeuroglancerViewer} from "../../viewer/neuroglancerViewer";
import {formatViewerState, standaloneViewerUrl} from "../../viewer/neuroglancerStateExport";
import {useAppLayout} from "../../hooks/useAppLayout";
import {errorNotification, successNotification} from "./NotificationHelper";

export const NeuroglancerControls = observer(({viewer, allowResetView, allowStateExport = false, children}: {
    viewer: NeuroglancerViewer,
    allowResetView: boolean,
    allowStateExport?: boolean,
    children?: React.ReactNode
}) => {
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

    // Must stay synchronous so the click's user activation still allows the popup.  With noopener, window.open
    // returns null even on success.
    const openInNeuroglancer = () => {
        if (viewer) {
            window.open(standaloneViewerUrl(viewer.currentState), "_blank", "noopener,noreferrer");
        }
    };

    const copyNeuroglancerState = async () => {
        if (!viewer) {
            return;
        }

        try {
            await navigator.clipboard.writeText(formatViewerState(viewer.currentState));
            successNotification("Copied to Clipboard", "Neuroglancer state copied to clipboard");
        } catch (err) {
            errorNotification("Copy Failed", err);
        }
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
                {allowStateExport ?
                    <Divider orientation="vertical"/> : null}
                {allowStateExport ?
                    <Tooltip label="Open this view in Neuroglancer in a new tab">
                        <ActionIcon variant="subtle" aria-label="Open in Neuroglancer" onClick={openInNeuroglancer}>
                            <IconExternalLink size={18}/>
                        </ActionIcon>
                    </Tooltip> : null}
                {allowStateExport ?
                    <Tooltip label="Copy the Neuroglancer state as JSON">
                        <ActionIcon variant="subtle" aria-label="Copy Neuroglancer state" onClick={copyNeuroglancerState}>
                            <IconCopy size={18}/>
                        </ActionIcon>
                    </Tooltip> : null}
            </Group>
            <Group>
                <Text size="xs" c="dimmed">{text}</Text>
                {children}
            </Group>
        </Group>
    );
});
