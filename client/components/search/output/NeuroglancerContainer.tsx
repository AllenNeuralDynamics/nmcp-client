import * as React from "react";
import {useEffect, useState} from "react";
import {useLazyQuery} from "@apollo/client";

import {NeuroglancerProxy} from "../../../viewer/neuroglancerProxy";
import {UserPreferences} from "../../../util/userPreferences";
import {NeuronViewModel} from "../../../viewmodel/neuronViewModel";
import {NEURON_VIEW_MODE_SOMA} from "../../../viewmodel/neuronViewMode";
import {NEAREST_NODE_QUERY, NearestNodeQueryResponse, NearestNodeQueryVariables} from "../../../graphql/search";
import {useSystemConfiguration} from "../../../hooks/useSystemConfiguration";
import {observer} from "mobx-react-lite";
import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";
import {useConstants} from "../../../hooks/useConstants";
import {useAtlas} from "../../../hooks/useAtlas";
import {AtlasNode} from "../../../models/atlasNode";
import {getThemeColor, useComputedColorScheme, useMantineTheme} from "@mantine/core";

export type NeuroglancerContainerProps = {
    elementName: string
    height: number;

    onSelectNode(node: AtlasNode, tracing: NeuronViewModel, isShiftKey: boolean, isCtrlKey: boolean, isAltKey: boolean): void;
    onPositionChanged(position: number[]): void;
}

export const NeuroglancerContainer = observer<NeuroglancerContainerProps>((props) => {
    const [ngProxy, setNgProxy] = useState<NeuroglancerProxy>(null);

    const constants = useConstants().AtlasConstants;
    const systemConfiguration = useSystemConfiguration();
    const queryViewModel = useQueryResponseViewModel();
    const atlas = useAtlas();

    const scheme = useComputedColorScheme();

    const [getNearest] = useLazyQuery<NearestNodeQueryResponse, NearestNodeQueryVariables>(NEAREST_NODE_QUERY);

    useEffect(() => {
        const proxy = NeuroglancerProxy.configureSearchNeuroglancer("neuroglancer-container", UserPreferences.Instance.searchViewerState, selectNeuron, selectSoma, systemConfiguration.precomputedLocation, constants.StructureColors, scheme);

        proxy.PositionListener = (position) => {
            if (props.onPositionChanged) {
                props.onPositionChanged(position);
            }
        };

        setNgProxy(proxy);

        setTimeout(() => {
            proxy?.resetView();
        }, 1000);

        return () => {
            proxy.unlinkNeuroglancerHandler();
        }
    }, []);

    useEffect(() => {
        ngProxy?.updateColorScheme(scheme);
    }, [scheme]);

    if (ngProxy) {
        const ids = atlas.displayedStructures.map(c => c.structure.structureId);

        ngProxy.updateSearchCompartments(ids);
    }

    if (ngProxy) {
        const known = queryViewModel.neuronViewModels.filter(n => n.isSelected);

        const somas = known.filter(n => n.viewMode == NEURON_VIEW_MODE_SOMA)
            .filter(n => n.soma);

        ngProxy.updateSearchReconstructions(somas, known);
    }

    const selectNeuron = async (neuron: NeuronViewModel, location: number[]) => {
        if (neuron) {
            await getNearest({
                variables: {id: neuron.ReconstructionId, location: [location[0] * 10, location[1] * 10, location[2] * 10]}, onCompleted: (data) => {
                    if (data?.nearestNode) {
                        props.onSelectNode(data?.nearestNode.node, neuron, false, false, false);
                    }
                }
            });
        }
    }

    const selectSoma = (node: AtlasNode, neuron: NeuronViewModel) => {
        if (node && neuron) {
            props.onSelectNode(node, neuron, false, false, false);
        }
    }

    return <div id="neuroglancer-container" style={{minHeight: 0, height: props.height, backgroundColor: "blue"}}/>
});
