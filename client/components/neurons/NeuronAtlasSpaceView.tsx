import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {useLazyQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Divider, Group, Stack, useComputedColorScheme} from "@mantine/core";

import {NEAREST_NODE_QUERY, NearestNodeQueryResponse, NearestNodeQueryVariables} from "../../graphql/search";
import {useAppLayout} from "../../hooks/useAppLayout";
import {useConstants} from "../../hooks/useConstants";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";
import {selectSomaLocation, SomaLocation} from "../../models/neuron";
import {Reconstruction} from "../../models/reconstruction";
import {AtlasSpaceViewer} from "../../viewer/atlasSpaceViewer";
import {AtlasViewModel} from "../../viewmodel/atlasViewModel";
import {DrawerState} from "../../viewmodel/appLayout";
import {NeuroglancerControls} from "../common/NeuroglancerControls";
import {AtlasContainer, AtlasContainerOpener} from "../search/output/atlas/AtlasContainer";
import {NeuronListContainerWidth} from "../search/output/NeuronListContainer";
import {SideDrawer} from "../search/output/SideDrawer";
import {AtlasViewerSelection} from "./AtlasViewerSelection";

type NeuronAtlasSpaceViewProps = {
    atlasId: string;
    reconstruction?: Reconstruction;
    soma?: SomaLocation;
};

export const NeuronAtlasSpaceView = observer(({atlasId, reconstruction, soma}: NeuronAtlasSpaceViewProps) => {
    const scheme = useComputedColorScheme();

    const systemConfiguration = useSystemConfiguration();

    const constants = useConstants();

    const [viewer, setViewer] = useState<AtlasSpaceViewer>(null);

    const [atlasViewModel] = useState(() => new AtlasViewModel(constants.getAtlas(atlasId)));

    const [getNearest, {data}] = useLazyQuery<NearestNodeQueryResponse, NearestNodeQueryVariables>(NEAREST_NODE_QUERY);

    const appLayout = useAppLayout();

    const atlasDrawerOpened = appLayout.atlasStructureDrawerState == DrawerState.Dock;

    const reconstructionRef = useRef(reconstruction);
    reconstructionRef.current = reconstruction;

    const somaLocation = selectSomaLocation(soma, reconstruction?.atlasReconstruction?.soma);

    // atlas space is voxels = microns / 10
    const somaPoint = somaLocation ? {x: somaLocation.x / 10, y: somaLocation.y / 10, z: somaLocation.z / 10} : null;

    useEffect(() => {
        const v = new AtlasSpaceViewer("neuron-atlas-ng-container", atlasViewModel, systemConfiguration.precomputedLocation, scheme == "dark");

        v.updateState();

        v.neuronSelectionListener = selectNeuron;

        const skeletonId = reconstruction?.atlasReconstruction?.precomputed?.skeletonId;
        v.setNeuronSkeletonId(skeletonId ? [skeletonId] : null);

        v.updateAtlasStructures(atlasViewModel.displayedStructures.map(c => c.structure.structureId));

        v.setSomaFocus(somaPoint);

        setViewer(v);

        return () => {
            v.unlink();
        }
    }, []);

    useEffect(() => {
        if (viewer) {
            const skeletonId = reconstruction?.atlasReconstruction?.precomputed?.skeletonId;
            viewer.setNeuronSkeletonId(skeletonId ? [skeletonId] : null);
        }
    }, [reconstruction]);

    useEffect(() => {
        if (viewer) {
            viewer.setSomaFocus(somaPoint);
        }
    }, [somaLocation?.x, somaLocation?.y, somaLocation?.z]);

    useEffect(() => {
        if (viewer) {
            viewer.colorScheme = scheme == "dark";
        }
    }, [scheme]);

    useEffect(() => {
        if (viewer) {
            viewer.updateAtlasStructures(atlasViewModel.displayedStructures.map(c => c.structure.structureId));
        }
    }, [atlasViewModel.displayedStructures]);

    const selectNeuron = async (location: number[]) => {
        const atlasReconstructionId = reconstructionRef.current?.atlasReconstruction?.id;

        if (atlasReconstructionId) {
            await getNearest({
                variables: {
                    id: atlasReconstructionId,
                    location: [location[0] * 10, location[1] * 10, location[2] * 10]
                }
            });
        }
    };

    return (
        <Group gap={0} align="stretch" style={{flexGrow: 1}} preventGrowOverflow={false}>
            <Stack gap={0} style={{flexGrow: 1}}>
                <Group gap={0} wrap="nowrap" bg="section">
                    <NeuroglancerControls viewer={viewer} allowResetView={true}/>
                    {atlasDrawerOpened ? null : <AtlasContainerOpener/>}
                </Group>
                <Divider orientation="horizontal"/><AtlasViewerSelection atlas={atlasViewModel.atlas} node={data?.nearestNode?.node ?? null} onClick={(id) => {atlasViewModel.toggle(id)}}/>
                <div id="neuron-atlas-ng-container" className="ng-default-container" style={{flexGrow: 1, minHeight: "600px"}}/>
            </Stack>
            {atlasDrawerOpened ? <Divider orientation="vertical"/> : null}
            <SideDrawer opened={atlasDrawerOpened} width={NeuronListContainerWidth} side="right" order={0}>
                {/* Out of flow so the structure tree cannot make the page taller; it scrolls within the viewer's height. */}
                <div style={{position: "relative", flexGrow: 1}}>
                    <div style={{position: "absolute", inset: 0, display: "flex"}}>
                        <AtlasContainer atlasViewModel={atlasViewModel}/>
                    </div>
                </div>
            </SideDrawer>
        </Group>
    )
});
