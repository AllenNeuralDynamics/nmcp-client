import * as React from "react";

import {ITracingViewerBaseProps, TracingViewer} from "./TracingViewer";
import {FetchState} from "./MainView";
import {primaryBackground} from "../../util/styles";
import {Icon} from "semantic-ui-react";
import {UserPreferences} from "../../util/userPreferences";
import {ViewerStyle} from "../../viewer/viewerStyle";
import {NeuroglancerProxy} from "../../viewer/neuroglancer/neuroglancer";

interface IViewerProps extends ITracingViewerBaseProps {
    isQueryCollapsed: boolean;
    isNeuronListDocked: boolean;
    isCompartmentListDocked: boolean;
    isNeuronListOpen: boolean;
    isCompartmentListOpen: boolean;

    fetchState: FetchState;
    fetchCount: number;
    isRendering: boolean;

    onFloatNeuronList(): void;

    onFloatCompartmentList(): void;

    onToggleQueryCollapsed(): void;

    onSetFetchState(fetchState: FetchState): void;

    onCancelFetch(): void;
}

export const ViewerContainer = React.forwardRef<TracingViewer, IViewerProps>((props, ref) => {
    const myRef = React.useRef<TracingViewer>(null);

    React.useImperativeHandle(ref, () => myRef.current!, []);

    const renderFloatNeuronListGlyph = () => {
        if (!props.isNeuronListDocked && !props.isNeuronListOpen) {
            return (
                <div style={{display: "flex", alignItems: "center", height: "100%"}}
                     onClick={() => props.onFloatNeuronList()}>
                    <h5 style={{color: "white", fontWeight: "lighter", margin: "0 6px 0 10px"}}>
                        Neurons</h5>
                    <Icon name="chevron right" style={{top: -1, order: 2}}
                    />
                </div>);
        } else {
            return null;
        }
    };

    const renderFloatCompartmentListGlyph = () => {
        if (!props.isCompartmentListDocked && !props.isCompartmentListOpen) {
            return (
                <div style={{display: "flex", alignItems: "center", height: "100%"}}
                     onClick={() => props.onFloatCompartmentList()}>
                    <Icon name="chevron left" style={{order: 1, top: -1}}/>
                    <h5 style={{
                        color: "white",
                        fontWeight: "lighter",
                        margin: "0 6px 0 10px",
                        order: 2
                    }}>
                        Compartments</h5>
                </div>);
        } else {
            return null;
        }
    };

    const renderCollapseQueryGlyph = () => {
        return (<Icon name={props.isQueryCollapsed ? "chevron down" : "chevron up"}
                      style={{margin: "auto", order: 3}}
                      onClick={() => props.onToggleQueryCollapsed()}/>)
    };

    const renderProgress = () => {
        if ((props.fetchCount > 0 && props.fetchState === FetchState.Running) || props.isRendering) {
            return (<div style={spinnerStyle}/>);
        }

        return null;
    };

    const renderMessage = () => {
        const isPaused = props.fetchState === FetchState.Paused;

        if (props.fetchCount > 0) {
            const iconName = isPaused ? "play" : "pause";

            return (
                <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <div style={{
                        flex: "", marginLeft: "10px", height: "100%", color: "white"
                    }}>
                        {`Fetching neuron tracings ( ${props.fetchCount} remaining ${isPaused ? "- paused" : ""})`}
                    </div>
                    <div style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                        height: "100%",
                        color: "white",
                        marginLeft: "10px"
                    }}>
                        <div style={{
                            display: "inline-block",
                            verticalAlign: "middle",
                            height: "100%",
                            border: "1px solid #ccc",
                            padding: "0px 10px"
                        }}>
                            <Icon name={iconName}
                                  style={{paddingTop: "2px", paddingBottom: "0px", paddingLeft: "1px"}}
                                  onClick={() => props.onSetFetchState(isPaused ? FetchState.Running : FetchState.Paused)}/>
                        </div>
                        <div style={{
                            display: "inline-block",
                            verticalAlign: "middle",
                            height: "100%",
                            border: "1px solid #ccc", marginLeft: "10px",
                            padding: "0px 10px"
                        }}>
                            <Icon name="remove"
                                  style={{paddingTop: "2px", paddingBottom: "0px", paddingLeft: "1px"}}
                                  onClick={() => props.onCancelFetch()}/>
                        </div>
                    </div>
                </div>
            );
        }

        if (props.isRendering) {
            return (
                <div>
                    <span style={{color: "white"}}>
                        Submitting tracing content for render...
                    </span>
                </div>
            );
        }

    };

    const renderResetView = () => {
        if (UserPreferences.Instance.ViewerStyle == ViewerStyle.Neuroglancer) {
            return (
                <span style={{marginRight: "6px", textDecoration: "underline"}} onClick={() => {
                    if (NeuroglancerProxy.SearchNeuroglancer) {
                        NeuroglancerProxy.SearchNeuroglancer.resetView();
                    }
                }}>Reset View</span>
            );
        }

        return null;
    }

    const renderHeader = () => {
        const isLeftGlyphVisible = !props.isNeuronListDocked && !props.isNeuronListOpen;
        const progressMarginLeft = isLeftGlyphVisible ? "20px" : "0px";
        return (
            <div style={{
                backgroundColor: primaryBackground,
                color: "white",
                height: "40px",
                minHeight: "40px",
                width: "100%",
                margin: "auto",
                padding: "0px",
                display: "flex",
                order: 1,
                flexDirection: "row"
            }}>
                <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
                    <div style={{flex: "0 0 auto", order: 1, width: "auto"}}>
                        {renderFloatNeuronListGlyph()}
                    </div>
                    <div style={{display: "flex", flexDirection: "column", flex: "1 1 auto", order: 2, width: "100%"}}>
                        <div style={{flex: "0 0 auto", order: 1, textAlign: "center", height: "15px"}}>
                            {renderCollapseQueryGlyph()}
                        </div>
                        <div style={{display: "flex", flexDirection: "row", flex: "1 1 auto", order: 2}}>
                            <div style={{
                                flex: "0 0 auto",
                                order: 1,
                                marginRight: "6px",
                                marginLeft: progressMarginLeft
                            }}>
                                {renderProgress()}
                            </div>
                            <div style={{flex: "1 1 auto", margin: "auto", order: 2, textAlign: "left"}}>
                                {renderMessage()}
                            </div>
                        </div>
                        <div style={{flex: "1 1 auto", order: 2, textAlign: "center", width: "100%"}}>
                            {props.isQueryCollapsed ?
                                <span onClick={() => props.onToggleQueryCollapsed()}>
                                    Show Search
                                </span> : null}
                        </div>
                        <div style={{flex: "1 1 auto", order: 2, textAlign: "right", width: "100%"}}>
                            {renderResetView()}
                        </div>
                    </div>
                    <div style={{flex: "0 0 auto", order: 3, width: "auto"}}>
                        {renderFloatCompartmentListGlyph()}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{
            flexDirection: "column",
            flexWrap: "nowrap",
            alignItems: "flex-start",
            alignContent: "flex-start",
            order: 2,
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 0,
            display: "flex",
            height: "100%",
            minWidth: "200px",
            borderTop: "1px solid",
            borderBottom: "1px solid"
        }}>
            {renderHeader()}
            <div style={{order: 2, flexGrow: 1, width: "100%", height: "100%"}}>
                <TracingViewer {...props} ref={myRef}/>
            </div>
        </div>
    );
});

const spinnerStyle = {
    width: 20,
    height: 20,
    border: "3px solid",
    borderColor: "white",
    borderBottomColor: "transparent",
    borderRadius: "100%",
    background: "transparent !important",
    verticalAlign: "middle",
    animation: "spinner 0.75s 0s infinite linear",
    animationFillMode: 'both',
    display: "inline-block",
};
