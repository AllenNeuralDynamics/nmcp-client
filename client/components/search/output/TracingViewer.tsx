import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";

import {usePreferences} from "../../../hooks/usePreferences";
import {ITracingNode} from "../../../models/tracingNode";
import {TracingViewModel} from "../../../viewmodel/tracingViewModel";
import {ViewerSelection} from "./ViewerSelection";
import {NeuroglancerContainer} from "./NeuroglancerContainer";

export type TracingViewerState = {
    renderWidth?: number;
    renderHeight?: number;
}

export const TracingViewer = observer(() => {
    const size = calculateDimensions();

    const ref = useRef(null);

    const preferences = usePreferences();

    const [state, setState] = useState<TracingViewerState>({
        renderWidth: size.width,
        renderHeight: size.height
    });

    const [selectedState, setSelectedState] = useState({
        selectedTracing: null,
        selectedNode: null
    });

    useEffect(() => {
        const observer = new ResizeObserver(() => {
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
    }, preferences.preferences.HideCursorInViewer ? {cursor: "none"} : {});

    const viewerContainer = <NeuroglancerContainer elementName="neuroglancer-viewer-container" height={state.renderHeight} width={state.renderWidth}
                                                   onSelectNode={(n, t, a, b, c) => onSelectNodeFromTracingNode(n, t, a, b, c)}/>

    return (
        <div id="viewer-parent" ref={ref} style={style}>
            <ViewerSelection selectedNode={selectedState.selectedNode} selectedTracing={selectedState.selectedTracing}/>
            {viewerContainer}
        </div>
    );
});

const relative: "relative" = "relative";
