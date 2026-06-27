import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {useLazyQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Divider, Group, Stack, useComputedColorScheme} from "@mantine/core";
import {useResizeObserver} from "@mantine/hooks";

import {NEAREST_NODE_QUERY, NearestNodeQueryResponse, NearestNodeQueryVariables} from "../../graphql/search";
import {useConstants} from "../../hooks/useConstants";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";
import {SomaLocation} from "../../models/neuron";
import {Reconstruction} from "../../models/reconstruction";
import {AtlasSpaceViewer} from "../../viewer/atlasSpaceViewer";
import {AtlasViewModel} from "../../viewmodel/atlasViewModel";
import {NeuroglancerControls} from "../common/NeuroglancerControls";
import {AtlasContainer} from "../search/output/atlas/AtlasContainer";
import {AtlasViewerSelection} from "./AtlasViewerSelection";

type NeuronAtlasSpaceViewProps = {
    reconstruction?: Reconstruction;
    soma?: SomaLocation;
    focusSoma?: SomaLocation;
    onFocusApplied?: () => void;
};

export const NeuronAtlasSpaceView = observer(({reconstruction, soma, focusSoma, onFocusApplied}: NeuronAtlasSpaceViewProps) => {
    const scheme = useComputedColorScheme();

    const systemConfiguration = useSystemConfiguration();

    const constants = useConstants().AtlasConstants;

    const [viewer, setViewer] = useState<AtlasSpaceViewer>(null);

    const [atlas, setAtlas] = useState(new AtlasViewModel());

    const [displayedStructures, setDisplayedStructures] = useState<number[]>([997]);

    const [getNearest, {data}] = useLazyQuery<NearestNodeQueryResponse, NearestNodeQueryVariables>(NEAREST_NODE_QUERY);

    const [ref, rect] = useResizeObserver();

    const height = Math.round(rect.height);

    const reconstructionRef = useRef(reconstruction);
    reconstructionRef.current = reconstruction;

    // atlas space is voxels = microns / 10, matching viewerPosition scaling
    const somaPoint = soma && Number.isFinite(soma.x) && Number.isFinite(soma.y) && Number.isFinite(soma.z)
        ? {x: soma.x / 10, y: soma.y / 10, z: soma.z / 10}
        : null;

    useEffect(() => {
        atlas.initialize(constants);

        const v = new AtlasSpaceViewer("neuron-atlas-ng-container", constants.StructureColors, systemConfiguration.precomputedLocation, scheme == "dark");

        v.updateState();

        v.neuronSelectionListener = selectNeuron;

        const skeletonId = reconstruction?.atlasReconstruction?.precomputed?.skeletonId;
        v.setNeuronSkeletonId(skeletonId ? [skeletonId] : null);

        v.updateAtlasStructures(displayedStructures);

        v.setSomaAnnotation(somaPoint);

        if (focusSoma) {
            if (Number.isFinite(focusSoma.x) && Number.isFinite(focusSoma.y) && Number.isFinite(focusSoma.z)) {
                // viewerPosition does not scale; atlas space is voxels = microns / 10
                v.viewerPosition = {x: focusSoma.x / 10, y: focusSoma.y / 10, z: focusSoma.z / 10};
            }
            onFocusApplied?.();
        }

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
            viewer.setSomaAnnotation(somaPoint);
        }
    }, [soma?.x, soma?.y, soma?.z]);

    useEffect(() => {
        if (viewer) {
            viewer.updateAtlasStructures(displayedStructures);
        }
    }, [displayedStructures]);

    useEffect(() => {
        if (viewer) {
            viewer.colorScheme = scheme == "dark";
        }
    }, [scheme]);

    useEffect(() => {
        if (viewer) {
            viewer.updateAtlasStructures(atlas.displayedStructures.map(c => c.structure.structureId));
        }
    }, [atlas.displayedStructures]);

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
        <Group ref={ref} gap={0} align="stretch" style={{flexGrow: 1, flexShrink: 0, flexBasis: 0, minHeight: 0}} preventGrowOverflow={false}>
            <Stack gap={0} style={{flexGrow: 1}}>
                <NeuroglancerControls viewer={viewer} allowResetView={true}/>
                <Divider orientation="horizontal"/><AtlasViewerSelection node={data?.nearestNode?.node ?? null} onClick={(id) => {atlas.toggle(id)}}/>
                <div id="neuron-atlas-ng-container" className="ng-default-container" style={{flexGrow: 1, minHeight: "600px"}}/>
            </Stack>
            <Divider orientation="vertical"/>
            <AtlasContainer atlasViewModel={atlas} maxHeight={height}/>
        </Group>
    )
});
