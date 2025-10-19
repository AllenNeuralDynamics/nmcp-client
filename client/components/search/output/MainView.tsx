import * as React from "react";
import {observer} from "mobx-react-lite";
import {Group} from "@mantine/core";
import {useResizeObserver} from "@mantine/hooks";

import "../../../util/override.css";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {NeuronListContainer} from "./NeuronListContainer";
import {AtlasContainer} from "./atlas/AtlasContainer";
import {DrawerState} from "../../../viewmodel/appLayout";
import {ViewerContainer} from "./ViewerContainer";

export const MainView = observer(() => {
    const appLayout = useAppLayout();

    const [ref, rect] = useResizeObserver();

    const height = Math.round(rect.height);

    const neuronListDock = appLayout.neuronDrawerState == DrawerState.Dock ? <NeuronListContainer maxHeight={height}/> : null;

    const compartmentListDock = appLayout.atlasStructureDrawerState == DrawerState.Dock ? <AtlasContainer maxHeight={height}/> : null;

    return (
        <Group ref={ref} gap={0} align="stretch" style={{flexGrow: 1, flexShrink: 0, flexBasis: 0, minHeight: 0}} preventGrowOverflow={false}>
            {neuronListDock}
            <div style={{order: 1, flexGrow: 1, display: "flex", justifyContent: "stretch"}}>
                <ViewerContainer maxHeight={height}/>
            </div>
            {compartmentListDock}
        </Group>
    );
});
