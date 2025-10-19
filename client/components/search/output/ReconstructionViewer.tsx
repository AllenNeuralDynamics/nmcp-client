import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {Stack} from "@mantine/core";
import {useResizeObserver} from "@mantine/hooks";

import {ViewerSelection} from "./ViewerSelection";
import {NeuroglancerContainer} from "./NeuroglancerContainer";
import {AtlasNode} from "../../../models/atlasNode";
import {NeuronViewModel} from "../../../viewmodel/neuronViewModel";

export const ReconstructionViewer = observer(({height, positionChanged}: { height: number, positionChanged: (p: number[]) => void } = null) => {
    const [selectedState, setSelectedState] = useState<{ selectedNeuron: NeuronViewModel, selectedNode: AtlasNode }>({
        selectedNeuron: null,
        selectedNode: null
    });

    function onSelectNodeFromTracingNode(node: AtlasNode, neuron: NeuronViewModel = null, isShiftKey: boolean = false, isCtrlKey: boolean = false, isAltKey: boolean = false) {
        if (!isCtrlKey && !isAltKey) {
            if (!isShiftKey) {
                if (node) {
                    setSelectedState({selectedNeuron: neuron, selectedNode: node});
                }
            }
        }
    }

    const viewerContainer = <NeuroglancerContainer elementName="neuroglancer-viewer-container" height={height}
                                                   onPositionChanged={positionChanged}
                                                   onSelectNode={(n, t, a, b, c) => onSelectNodeFromTracingNode(n, t, a, b, c)}/>

    return (
        <Stack style={{flexGrow: 1}}>
            <ViewerSelection node={selectedState.selectedNode} neuron={selectedState.selectedNeuron}/>
            <div style={{height: height}}>
                {viewerContainer}
            </div>
        </Stack>
    );
});
