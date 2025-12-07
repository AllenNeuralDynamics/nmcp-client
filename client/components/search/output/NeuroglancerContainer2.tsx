import * as React from "react";
import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {useLazyQuery} from "@apollo/client";
import {useComputedColorScheme} from "@mantine/core";

import {NeuronViewModel} from "../../../viewmodel/neuronViewModel";
import {NEURON_VIEW_MODE_SOMA} from "../../../viewmodel/neuronViewMode";
import {NEAREST_NODE_QUERY, NearestNodeQueryResponse, NearestNodeQueryVariables} from "../../../graphql/search";
import {useSystemConfiguration} from "../../../hooks/useSystemConfiguration";
import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";
import {useConstants} from "../../../hooks/useConstants";
import {useAtlas} from "../../../hooks/useAtlas";
import {AtlasNode} from "../../../models/atlasNode";
import {SearchViewer} from "../../../viewer/searchViewer";

export type NeuroglancerContainerProps = {
    elementName: string
    height: number;

    onSelectNode(node: AtlasNode, tracing: NeuronViewModel, isShiftKey: boolean, isCtrlKey: boolean, isAltKey: boolean): void;
    // onPositionChanged(position: number[]): void;
}

export const NeuroglancerContainer2 = observer<NeuroglancerContainerProps>((props) => {
    const [viewer, setViewer] = useState<SearchViewer>(null);

    const constants = useConstants().AtlasConstants;
    const systemConfiguration = useSystemConfiguration();
    const queryViewModel = useQueryResponseViewModel();
    const atlas = useAtlas();

    const scheme = useComputedColorScheme();

    const [getNearest] = useLazyQuery<NearestNodeQueryResponse, NearestNodeQueryVariables>(NEAREST_NODE_QUERY);

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

    const selectSoma = (neuron: NeuronViewModel) => {
        if (neuron && neuron.soma) {
            props.onSelectNode(neuron.soma, neuron, false, false, false);
        }
    }

    return <div id="neuroglancer-container" className="ng-default-container" style={{minHeight: 0, height: props.height}}/>
});
