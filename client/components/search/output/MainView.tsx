import * as React from "react";
import {observer} from "mobx-react-lite";
import {Group} from "@mantine/core";

import "../../../util/override.css";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {NeuronListContainer, NeuronListContainerWidth} from "./NeuronListContainer";
import {AtlasContainer} from "./atlas/AtlasContainer";
import {DrawerState} from "../../../viewmodel/appLayout";
import {SearchView} from "./SearchView";
import {SideDrawer} from "./SideDrawer";
import {useSearchAtlas} from "../../../hooks/useSearchAtlas";

export const MainView = observer(() => {
    const appLayout = useAppLayout();
    const searchAtlas = useSearchAtlas();

    const atlasViewModel = searchAtlas.atlasViewModel;

    return (
        <Group gap={0} align="stretch" style={{flexGrow: 1, flexShrink: 0, flexBasis: 0, minHeight: 0}} preventGrowOverflow={false}>
            <SideDrawer opened={appLayout.neuronDrawerState == DrawerState.Dock} width={NeuronListContainerWidth} side="left" order={0}>
                <NeuronListContainer/>
            </SideDrawer>
            <div style={{order: 1, flexGrow: 1, display: "flex", justifyContent: "stretch"}}>
                <SearchView/>
            </div>
            <SideDrawer opened={appLayout.atlasStructureDrawerState == DrawerState.Dock && atlasViewModel != null} width={NeuronListContainerWidth}
                        side="right" order={2}>
                {atlasViewModel ? <AtlasContainer atlasViewModel={atlasViewModel}/> : null}
            </SideDrawer>
        </Group>
    );
});
