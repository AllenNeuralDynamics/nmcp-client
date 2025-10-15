import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";

import {ITracingNode} from "../../../models/tracingNode";
import {TracingViewModel} from "../../../viewmodel/tracingViewModel";
import {IPositionInput} from "../../../viewmodel/filterContents";
import {ViewerSelection} from "./ViewerSelection";
import {NeuroglancerContainer} from "./NeuroglancerContainer";
import {UserPreferences} from "../../../util/userPreferences";

export interface ITracingViewerBaseProps {
    populateCustomPredicate(position: IPositionInput, replace: boolean): void;
}


export type TracingViewerState = {
    renderWidth?: number;
    renderHeight?: number;
}

export const TracingViewer = observer<React.FC<ITracingViewerBaseProps>>((props: ITracingViewerBaseProps) => {
    const size = calculateDimensions();

    const ref = useRef(null);

    const [state, setState] = useState<TracingViewerState>({
        renderWidth: size.width,
        renderHeight: size.height
    });

    const [selectedState, setSelectedState] = useState({
        selectedTracing: null,
        selectedNode: null
    });

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            updateDimensions();
        });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
            observer.disconnect();
        };
    }, []);

    function reset() {
        setSelectedState({selectedTracing: null, selectedNode: null});
    }

    function calculateDimensions() {
        const container = document.getElementById("viewer-parent");

        if (!container) {
            return {width: 0, height: 0};
        }

        let width = container.clientWidth;
        let height = container.clientHeight;

        console.log(`calculate dimensions ${width} x ${height}`);

        return {width, height};
    }

    function updateDimensions() {
        const {width, height} = calculateDimensions();

        if (width > 0 && height > 0) {
            setState({renderWidth: width, renderHeight: height});
        }
    }

    function onSelectNodeFromTracingNode(node: ITracingNode, tracing: TracingViewModel = null, isShiftKey: boolean = false, isCtrlKey: boolean = false, isAltKey: boolean = false) {
        if (!isCtrlKey && !isAltKey) {
            if (!isShiftKey) {
                if (node) {
                    setSelectedState({selectedTracing: tracing, selectedNode: node});
                }
            }
        }
    }

    const style = Object.assign({
        height: "100%",
        width: "100%",
        position: relative
    }, UserPreferences.Instance.HideCursorInViewer ? {cursor: "none"} : {});

    const viewerContainer = <NeuroglancerContainer elementName="neuroglancer-viewer-container" height={state.renderHeight} width={state.renderWidth}
                                                   onSelectNode={(n, t, a, b, c) => onSelectNodeFromTracingNode(n, t, a, b, c)}/>

    return (
        <div id="viewer-parent" ref={ref} style={style}>
            <ViewerSelection selectedNode={selectedState.selectedNode} selectedTracing={selectedState.selectedTracing}
                             populateCustomPredicate={props.populateCustomPredicate}/>
            {viewerContainer}
        </div>
    );
});

const relative: "relative" = "relative";
