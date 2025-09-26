import * as React from "react";
import {useEffect, useState} from "react";
import {observer} from "mobx-react";
import * as _ from "lodash-es";
import cuid from "cuid";

import {ITracingNode} from "../../models/tracingNode";
import {TracingViewModel} from "../../viewmodel/tracingViewModel";
import {BrainCompartmentViewModel} from "../../viewmodel/brainCompartmentViewModel";
import {IPositionInput} from "../../models/queryFilter";
import {ViewerSelection} from "./ViewerSelection";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {NeuroglancerContainer} from "./NeuroglancerContainer";
import {UserPreferences} from "../../util/userPreferences";

export enum HighlightSelectionMode {
    Normal,
    Cycle
}

export interface ITracingViewerBaseProps {
    compartments: BrainCompartmentViewModel[];
    tracings: TracingViewModel[];
    neuronViewModels: NeuronViewModel[];
    fixedAspectRatio?: number;
    displayHighlightedOnly: boolean;
    highlightSelectionMode: HighlightSelectionMode;
    cycleFocusNeuronId: string;

    onHighlightTracing(neuron: NeuronViewModel, highlight?: boolean): void;

    onSelectNode?(tracing: TracingViewModel, node: ITracingNode): void;

    onToggleTracing(id: string): void;

    onToggleCompartment(id: string): void;

    onToggleDisplayHighlighted(): void;

    onChangeHighlightMode(): void;

    onSetHighlightedNeuron(neuron: NeuronViewModel): void;

    onCycleHighlightNeuron(direction: number): void;

    populateCustomPredicate(position: IPositionInput, replace: boolean): void;

    onChangeNeuronViewMode(neuron: NeuronViewModel, viewMode: NeuronViewMode): void;
}

interface ITracingViewerProps extends ITracingViewerBaseProps {
}

export type TracingViewerState = {
    renderWidth?: number;
    renderHeight?: number;

    selectedTracing?: TracingViewModel;
    selectedNode?: ITracingNode;

    triggerRender: boolean;
}

export const TracingViewer = observer<React.FC<ITracingViewerProps>>((props: ITracingViewerProps) => {
    const [state, setState] = useState<TracingViewerState>({
        renderWidth: 0,
        renderHeight: 0,
        selectedTracing: null,
        selectedNode: null,
        triggerRender: false
    });

    useEffect(() => {
        updateDimensions();

        window.addEventListener("resize", updateDimensions);

        return () => {
            window.removeEventListener("resize", () => updateDimensions);
        }
    }, []);

    function reset() {
        setState({...state, selectedNode: null, selectedTracing: null});
    }

    function onToggleDisplayHighlighted() {
        props.onToggleDisplayHighlighted();
    }

    function calculateDimensions() {
        const container = document.getElementById("viewer-parent");

        if (!container) {
            return {width: 0, height: 0};
        }

        let width = container.clientWidth;
        let height = container.clientHeight;

        if (props.fixedAspectRatio) {
            width = Math.min(width, height * props.fixedAspectRatio);

            const aspectRatio = width / height;

            if (aspectRatio > props.fixedAspectRatio) {
                // constrained by height
                width = props.fixedAspectRatio * height;
            } else {
                // constrained by width
                height = width / props.fixedAspectRatio;
            }
        }

        return {width, height};
    }

    function updateDimensions() {
        const {width, height} = calculateDimensions();

        setState({...state, renderWidth: width, renderHeight: height});
    }

    function onRemoveActiveTracing(neuron: NeuronViewModel) {
        props.onHighlightTracing(neuron, false);
    }

    function onSelectNodeFromTracingNode(node: ITracingNode, tracing: TracingViewModel = null, isShiftKey: boolean = false, isCtrlKey: boolean = false, isAltKey: boolean = false) {
        if (!isCtrlKey && !isAltKey) {
            if (!isShiftKey) {
                if (node) {
                    setState({...state, selectedTracing: tracing, selectedNode: node});

                    if (props.onSelectNode) {
                        props.onSelectNode(tracing, node);
                    }
                } else {
                }
            } else {
                if (tracing) {
                    props.onHighlightTracing(tracing.neuron);
                }
            }
        }
    }

    const activeNeurons = _.uniqBy(props.tracings.map(t => t.neuron).filter(n => n.isInHighlightList), "IdOrDoi");

    const style = Object.assign({
        height: "100%",
        width: "100%",
        position: relative
    }, UserPreferences.Instance.HideCursorInViewer ? {cursor: "none"} : {});

    const viewerContainer = <NeuroglancerContainer elementName="neuroglancer-viewer-container" height={state.renderHeight}
                                                   width={state.renderWidth}
                                                   neuronViewModels={props.neuronViewModels} compartments={props.compartments} nonce={cuid()}
                                                   onSelectNode={(n, t, a, b, c) => onSelectNodeFromTracingNode(n, t, a, b, c)}/>

    return (
        <div id="viewer-parent" style={style}>
            <ViewerSelection selectedNode={state.selectedNode}
                             selectedTracing={state.selectedTracing}
                             displayHighlightedOnly={props.displayHighlightedOnly}
                             highlightSelectionMode={props.highlightSelectionMode}
                             cycleFocusNeuronId={props.cycleFocusNeuronId}
                             activeNeurons={activeNeurons}
                             onChangeNeuronViewMode={props.onChangeNeuronViewMode}
                             onRemoveActiveTracing={(n) => onRemoveActiveTracing(n)}
                             onToggleTracing={props.onToggleTracing}
                             onToggleLimitToHighlighted={() => onToggleDisplayHighlighted()}
                             onToggleLoadedGeometry={props.onToggleCompartment}
                             onChangeHighlightMode={() => props.onChangeHighlightMode()}
                             onSetHighlightedNeuron={(n: NeuronViewModel) => props.onSetHighlightedNeuron(n)}
                             onCycleHighlightNeuron={(d: number) => props.onCycleHighlightNeuron(d)}
                             populateCustomPredicate={props.populateCustomPredicate}/>
            {viewerContainer}
        </div>
    );
});

const relative: "relative" = "relative";
