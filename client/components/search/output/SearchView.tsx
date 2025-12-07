import * as React from "react";
import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {useLazyQuery} from "@apollo/client";
import {ActionIcon, Divider, Group, Stack, Text, useComputedColorScheme} from "@mantine/core";

import {NeuronViewModel} from "../../../viewmodel/neuronViewModel";
import {NEAREST_NODE_QUERY, NearestNodeQueryResponse, NearestNodeQueryVariables} from "../../../graphql/search";
import {useSystemConfiguration} from "../../../hooks/useSystemConfiguration";
import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";
import {useConstants} from "../../../hooks/useConstants";
import {useAtlas} from "../../../hooks/useAtlas";
import {AtlasNode} from "../../../models/atlasNode";
import {SearchViewer} from "../../../viewer/searchViewer";
import {ViewerSelection} from "./ViewerSelection";
import {NeuroglancerControls} from "../../common/NeuroglancerControls";
import {DrawerState} from "../../../viewmodel/appLayout";
import {IconChevronLeft, IconChevronRight} from "@tabler/icons-react";
import {useAppLayout} from "../../../hooks/useAppLayout";

export const SearchView = observer(({height}: { height: number }) => {
    const [viewer, setViewer] = useState<SearchViewer>(null);

    const [selectedNeuron, setSelectedNeuron] = useState<NeuronViewModel | null>(null);

    const [soma, setSoma] = useState<AtlasNode>(null);

    const constants = useConstants().AtlasConstants;
    const systemConfiguration = useSystemConfiguration();
    const appLayout = useAppLayout();
    const queryViewModel = useQueryResponseViewModel();
    const atlas = useAtlas();

    const scheme = useComputedColorScheme();

    const [getNearest, {called, loading, data}] = useLazyQuery<NearestNodeQueryResponse, NearestNodeQueryVariables>(NEAREST_NODE_QUERY);

    useEffect(() => {
        const v = new SearchViewer("neuroglancer-container", constants.StructureColors, systemConfiguration.precomputedLocation, scheme == "dark");

        v.updateState();

        v.neuronSelectionListener = selectNeuron;

        v.somaSelectionDelegate = selectSoma;

        setViewer(v);

        setTimeout(() => {
            v?.resetView();
        }, 1000);

        return () => {
            v.unlink();
        }
    }, []);

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

    if (viewer) {
        const known = queryViewModel.neuronViewModels.filter(n => n.isSelected);

        viewer.updateReconstructions(known);
    }

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
                    <ActionIcon variant="subtle"
                                onClick={() => appLayout.setAtlasStructureDrawerState(DrawerState.Dock)}>
                        <IconChevronLeft size={22}/>
                    </ActionIcon>
                    <Text>Atlas Structures</Text>
                </Group>
            );
        } else {
            return <Group p={0} gap={0}><Divider orientation="vertical"/></Group>;
        }
    };

    const selectNeuron = async (neuron: NeuronViewModel, location: number[]) => {
        if (neuron) {
            setSelectedNeuron(neuron);

            await getNearest({
                variables: {
                    id: neuron.ReconstructionId,
                    location: [location[0] * 10, location[1] * 10, location[2] * 10]
                }
            });
        }
    };

    const selectSoma = (neuron: NeuronViewModel) => {
        if (neuron) {
            setSelectedNeuron(neuron);
            if (neuron.soma) {
                setSoma(neuron.soma);
            }
        }
    };

    return (
        <Stack gap={0} style={{flexGrow: 1}}>
            <Group gap={0} align="space-between" bg="section" style={{height: "40px"}}>
                {renderNeuronOpen()}
                <NeuroglancerControls viewer={viewer}/>
                {renderAtlasStructureOpen()}
            </Group>
            <Stack style={{height: height, position: "relative"}}>
                <ViewerSelection node={soma ?? data?.nearestNode?.node ?? null} neuron={selectedNeuron}/>
                <div id="neuroglancer-container" className="ng-default-container"
                     style={{minHeight: 0, height: height}}/>
            </Stack>
        </Stack>
    );
});
