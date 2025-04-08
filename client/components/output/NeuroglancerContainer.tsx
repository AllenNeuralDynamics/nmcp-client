import * as React from "react";
import {useEffect, useState} from "react";

import {NeuroglancerProxy} from "../../util/neuroglancer";
import {UserPreferences} from "../../util/userPreferences";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {NEURON_VIEW_MODE_SOMA, NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {ITracingNode, nodesAsAnnotation} from "../../models/tracingNode";
import {TracingViewModel} from "../../viewmodel/tracingViewModel";
import {useLazyQuery} from "@apollo/react-hooks";
import {NEAREST_NODE_QUERY, NearestNodeQueryResponse, NearestNodeQueryVariables} from "../../graphql/search";

export type NeuroglancerContainerProps = {
    neuronViewModels: NeuronViewModel[]
    compartments: any[];
    elementName: string
    width: number;
    height: number;

    onSelectNode(node: ITracingNode, tracing: TracingViewModel, isShiftKey: boolean, isCtrlKey: boolean, isAltKey: boolean): void;
}

export const NeuroglancerContainer = (props: NeuroglancerContainerProps) => {
    const [ngProxy, setNgProxy] = useState<NeuroglancerProxy>(null)

    const [getNearest] = useLazyQuery<NearestNodeQueryResponse, NearestNodeQueryVariables>(NEAREST_NODE_QUERY);

    useEffect(() => {
        const proxy = NeuroglancerProxy.configureSearchNeuroglancer("neuroglancer-container", UserPreferences.Instance.searchViewerState, selectNeuron);

        setNgProxy(proxy);

        return () => {
            proxy.unlinkNeuroglancerHandler();
        }
    }, []);

    useEffect(() => {
        if (ngProxy) {
            const s = props.neuronViewModels.filter(n => n.CurrentViewMode == NEURON_VIEW_MODE_SOMA)
                .map(n => n.somaOnlyTracing.soma)

            const a = props.neuronViewModels.filter(n => n.CurrentViewMode != NEURON_VIEW_MODE_SOMA)
                .filter(n =>  n.SkeletonSegmentId != null)
            const x = nodesAsAnnotation(s);
            ngProxy.updateSearchReconstructions(x, a);
        }
    }, [props.neuronViewModels]);


    useEffect(() => {
        if (ngProxy) {
            const ids = props.compartments.filter(c => c.isDisplayed).map(c => c.compartment.structureId)
            ngProxy.updateSearchCompartments(ids);
        }
    }, [props.compartments]);

    const selectNeuron = async (neuron: NeuronViewModel, location: number[]) => {
        if (neuron) {
            await getNearest({
                variables: {id: neuron.Reconstruction.id, location: [location[0] * 10, location[1] * 10, location[2] * 10]}, onCompleted: (data) => {
                    if (data?.nearestNode) {
                        props.onSelectNode(data?.nearestNode.node, neuron.tracings[0], false, false, false);
                    }
                }
            });
        }
    }

    return <div id="neuroglancer-container" style={{minHeight: props.height, padding: "40px"}}/>
}
