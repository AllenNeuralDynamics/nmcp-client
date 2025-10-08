import * as React from "react";
import {useEffect, useState} from "react";
import {useLazyQuery} from "@apollo/client";

import {NeuroglancerProxy} from "../../../viewer/neuroglancerProxy";
import {UserPreferences} from "../../../util/userPreferences";
import {NeuronViewModel} from "../../../viewmodel/neuronViewModel";
import {NEURON_VIEW_MODE_SOMA} from "../../../viewmodel/neuronViewMode";
import {ITracingNode} from "../../../models/tracingNode";
import {TracingViewModel} from "../../../viewmodel/tracingViewModel";
import {NEAREST_NODE_QUERY, NearestNodeQueryResponse, NearestNodeQueryVariables} from "../../../graphql/search";
import {useSystemConfiguration} from "../../../hooks/useSystemConfiguration";
import {observer} from "mobx-react";
import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";
import {useConstants} from "../../../hooks/useConstants";
import {useAtlas} from "../../../hooks/useAtlas";

export type NeuroglancerContainerProps = {
    elementName: string
    width: number;
    height: number;

    onSelectNode(node: ITracingNode, tracing: TracingViewModel, isShiftKey: boolean, isCtrlKey: boolean, isAltKey: boolean): void;
}

export const NeuroglancerContainer = observer<React.FC<NeuroglancerContainerProps>>((props) => {
    const [ngProxy, setNgProxy] = useState<NeuroglancerProxy>(null);

    const constants = useConstants();
    const systemConfiguration = useSystemConfiguration();
    const queryViewModel = useQueryResponseViewModel();
    const atlas = useAtlas();

    const [getNearest] = useLazyQuery<NearestNodeQueryResponse, NearestNodeQueryVariables>(NEAREST_NODE_QUERY);

    useEffect(() => {
        const proxy = NeuroglancerProxy.configureSearchNeuroglancer("neuroglancer-container", UserPreferences.Instance.searchViewerState, selectNeuron, selectSoma, systemConfiguration.precomputedLocation, constants.BrainStructureColorMap);

        setNgProxy(proxy);

        return () => {
            proxy.unlinkNeuroglancerHandler();
        }
    }, []);

    if (ngProxy) {
        const ids = atlas.displayedStructures.map(c => c.structure.structureId);

        ngProxy.updateSearchCompartments(ids);
    }

    if (ngProxy) {
        const known = queryViewModel.neuronViewModels.filter(n => n.isSelected);

        const somas = known.filter(n => n.viewMode == NEURON_VIEW_MODE_SOMA)
            .filter(n => n.somaOnlyTracing?.soma);

        ngProxy.updateSearchReconstructions(somas, known);
    }

    const selectNeuron = async (neuron: NeuronViewModel, location: number[]) => {
        if (neuron) {
            await getNearest({
                variables: {id: neuron.ReconstructionId, location: [location[0] * 10, location[1] * 10, location[2] * 10]}, onCompleted: (data) => {
                    if (data?.nearestNode) {
                        props.onSelectNode(data?.nearestNode.node, neuron.tracings[0], false, false, false);
                    }
                }
            });
        }
    }

    const selectSoma = (node: ITracingNode, neuron: NeuronViewModel) => {
        if (node && neuron) {
            props.onSelectNode(node, neuron.tracings[0], false, false, false);
        }
    }

    return <div id="neuroglancer-container" style={{minHeight: props.height, padding: "40px"}}/>
});
