import * as React from "react";
import {useContext, useEffect, useState} from "react";
import {useLazyQuery} from "@apollo/client";

import {NeuroglancerProxy} from "../../viewer/neuroglancer";
import {UserPreferences} from "../../util/userPreferences";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {NEURON_VIEW_MODE_SOMA} from "../../viewmodel/neuronViewMode";
import {ITracingNode} from "../../models/tracingNode";
import {TracingViewModel} from "../../viewmodel/tracingViewModel";
import {NEAREST_NODE_QUERY, NearestNodeQueryResponse, NearestNodeQueryVariables} from "../../graphql/search";
import {ConstantsContext} from "../app/AppConstants";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";

export type NeuroglancerContainerProps = {
    neuronViewModels: NeuronViewModel[]
    nonce: any;
    compartments: any[];
    elementName: string
    width: number;
    height: number;

    onSelectNode(node: ITracingNode, tracing: TracingViewModel, isShiftKey: boolean, isCtrlKey: boolean, isAltKey: boolean): void;
}

export const NeuroglancerContainer = (props: NeuroglancerContainerProps) => {
    const [ngProxy, setNgProxy] = useState<NeuroglancerProxy>(null);

    const Constants = useContext(ConstantsContext);
    const systemConfiguration = useSystemConfiguration();

    const [getNearest] = useLazyQuery<NearestNodeQueryResponse, NearestNodeQueryVariables>(NEAREST_NODE_QUERY);

    useEffect(() => {
        const proxy = NeuroglancerProxy.configureSearchNeuroglancer("neuroglancer-container", UserPreferences.Instance.searchViewerState, selectNeuron, selectSoma, systemConfiguration.precomputedLocation, Constants.BrainStructureColorMap);

        setNgProxy(proxy);

        return () => {
            proxy.unlinkNeuroglancerHandler();
        }
    }, []);

    useEffect(() => {
        if (ngProxy) {
            const somas = props.neuronViewModels.filter(n => n.CurrentViewMode == NEURON_VIEW_MODE_SOMA)
                .filter(n => n.somaOnlyTracing?.soma);

            ngProxy.updateSearchReconstructions(somas, props.neuronViewModels);
        }
    }, [props.neuronViewModels, props.nonce]);


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

    const selectSoma = (node: ITracingNode, neuron: NeuronViewModel) => {
        if (node && neuron) {
            props.onSelectNode(node, neuron.tracings[0], false, false, false);
        }
    }

    return <div id="neuroglancer-container" style={{minHeight: props.height, padding: "40px"}}/>
}
