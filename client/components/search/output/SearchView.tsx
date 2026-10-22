import * as React from "react";
import {useEffect, useState} from "react";
import {useLazyQuery} from "@apollo/client";
import {autorun} from "mobx";
import {observer} from "mobx-react-lite";
import {ActionIcon, Divider, Group, Stack, Text, useComputedColorScheme} from "@mantine/core";
import {IconChevronRight} from "@tabler/icons-react";

import {NEAREST_NODE_QUERY, NearestNodeQueryResponse, NearestNodeQueryVariables} from "../../../graphql/search";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {useSearchAtlas} from "../../../hooks/useSearchAtlas";
import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";
import {useSearchViewer} from "../../../hooks/useSearchViewer";
import {useSystemConfiguration} from "../../../hooks/useSystemConfiguration";
import {AtlasNode} from "../../../models/atlasNode";
import {DrawerState} from "../../../viewmodel/appLayout";
import {NeuronViewModel} from "../../../viewmodel/neuronViewModel";
import {SearchViewer} from "../../../viewer/searchViewer";
import {NeuroglancerControls} from "../../common/NeuroglancerControls";
import {ViewerSelection} from "./ViewerSelection";
import {AtlasContainerOpener} from "./atlas/AtlasContainer";

export const SearchView = observer(() => {
    const [viewer, setViewer] = useState<SearchViewer>(null);

    const [selectedNeuron, setSelectedNeuron] = useState<NeuronViewModel | null>(null);

    const [soma, setSoma] = useState<AtlasNode>(null);

    const atlasViewModel = useSearchAtlas().atlasViewModel;
    const systemConfiguration = useSystemConfiguration();
    const appLayout = useAppLayout();
    const queryViewModel = useQueryResponseViewModel();
    const searchViewerRef = useSearchViewer();

    const scheme = useComputedColorScheme();

    const [getNearest, {called, loading, data}] = useLazyQuery<NearestNodeQueryResponse, NearestNodeQueryVariables>(NEAREST_NODE_QUERY);

    useEffect(() => {
        const v = new SearchViewer("neuroglancer-container", atlasViewModel, systemConfiguration.precomputedLocation, scheme == "dark");

        v.updateState();

        v.neuronSelectionListener = selectNeuron;

        v.somaSelectionDelegate = selectSoma;

        setViewer(v);

        const restoredState = searchViewerRef.register(v);

        if (!restoredState) {
            setTimeout(() => {
                v?.resetView();
            }, 1000);
        }

        return () => {
            searchViewerRef.unregister();
            v.unlink();
        }
    }, []);

    useEffect(() => {
        if (viewer) {
            viewer.colorScheme = scheme == "dark";
        }
    }, [scheme]);

    useEffect(() => {
        if (viewer && atlasViewModel) {
            viewer.updateAtlasStructures(atlasViewModel.displayedStructures.map(c => c.structure.structureId));
        }
    }, [atlasViewModel?.displayedStructures]);

    // Each update resets and restores the whole Neuroglancer state, so it must follow the neuron view models rather than
    // every render.  The autorun tracks exactly the observables the update reads.
    useEffect(() => {
        if (!viewer) {
            return;
        }

        return autorun(() => viewer.updateReconstructions(queryViewModel.neuronViewModels.filter(n => n.isSelected)));
    }, [viewer, queryViewModel]);

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
        // Without an atlas there is no drawer to open, and docking would hide this control.
        if (appLayout.atlasStructureDrawerState == DrawerState.Hidden && atlasViewModel) {
            return <AtlasContainerOpener/>;
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
                <NeuroglancerControls viewer={viewer} allowResetView={true}/>
                {renderAtlasStructureOpen()}
            </Group>
            <Stack style={{flexGrow: 1, minHeight: 0, position: "relative"}}>
                <ViewerSelection node={soma ?? data?.nearestNode?.node ?? null} neuron={selectedNeuron}/>
                <div id="neuroglancer-container" className="ng-default-container" style={{flexGrow: 1, minHeight: 0}}/>
            </Stack>
        </Stack>
    );
});
