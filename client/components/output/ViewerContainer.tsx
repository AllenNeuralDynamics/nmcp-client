import * as React from "react";

import {ITracingViewerBaseProps, TracingViewer} from "./TracingViewer";
import {FetchState} from "./MainView";
import {primaryBackground} from "../../util/styles";
import {Icon} from "semantic-ui-react";

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

interface IViewerContainerState {
}

export class ViewerContainer extends React.Component<IViewerProps, IViewerContainerState> {

    private readonly myRef: React.RefObject<TracingViewer>;

    public constructor(props: IViewerProps) {
        super(props);

        this.myRef = React.createRef<TracingViewer>();
        this.state = {}
    }

    public get TracingViewer() {
        return this.myRef;
    }

    private renderFloatNeuronListGlyph() {
        if (!this.props.isNeuronListDocked && !this.props.isNeuronListOpen) {
            return (
                <div style={{display: "flex", alignItems: "center", height: "100%"}}
                     onClick={() => this.props.onFloatNeuronList()}>
                    <h5 style={{color: "white", fontWeight: "lighter", margin: "0 6px 0 10px"}}>
                        Neurons</h5>
                    <Icon name="chevron right" style={{top: -1, order: 2}}
                    />
                </div>);
        } else {
            return null;
        }
    }

    private renderFloatCompartmentListGlyph() {
        if (!this.props.isCompartmentListDocked && !this.props.isCompartmentListOpen) {
            return (
                <div style={{display: "flex", alignItems: "center", height: "100%"}}
                     onClick={() => this.props.onFloatCompartmentList()}>
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
    }

    private renderCollapseQueryGlyph() {
        return (<Icon name={this.props.isQueryCollapsed ? "chevron down" : "chevron up"}
                           style={{margin: "auto", order: 3}}
                           onClick={() => this.props.onToggleQueryCollapsed()}/>)
    }

    private renderProgress() {
        if ((this.props.fetchCount > 0 && this.props.fetchState === FetchState.Running) || this.props.isRendering) {
            return (<div style={spinnerStyle}/>);
        }

        return null;
    }

    private renderMessage() {
        const isPaused = this.props.fetchState === FetchState.Paused;

        if (this.props.fetchCount > 0) {
            const iconName = isPaused ? "play" : "pause";

            return (
                <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <div style={{
                        flex: "", marginLeft: "10px", height: "100%", color: "white"
                    }}>
                        {`Fetching neuron tracings ( ${this.props.fetchCount} remaining ${isPaused ? "- paused" : ""})`}
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
                                       onClick={() => this.props.onSetFetchState(isPaused ? FetchState.Running : FetchState.Paused)}/>
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
                                       onClick={() => this.props.onCancelFetch()}/>
                        </div>
                    </div>
                </div>
            );
        }

        if (this.props.isRendering) {
            return (
                <div>
                    <span style={{color: "white"}}>
                        Submitting tracing content for render...
                    </span>
                </div>
            );
        }

    }

    private renderHeader() {
        const isLeftGlyphVisible = !this.props.isNeuronListDocked && !this.props.isNeuronListOpen;
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
                        {this.renderFloatNeuronListGlyph()}
                    </div>
                    <div style={{display: "flex", flexDirection: "column", flex: "1 1 auto", order: 2, width: "100%"}}>
                        <div style={{flex: "0 0 auto", order: 1, textAlign: "center", height: "15px"}}>
                            {this.renderCollapseQueryGlyph()}
                        </div>
                        <div style={{display: "flex", flexDirection: "row", flex: "1 1 auto", order: 2}}>
                            <div style={{
                                flex: "0 0 auto",
                                order: 1,
                                marginRight: "6px",
                                marginLeft: progressMarginLeft
                            }}>
                                {this.renderProgress()}
                            </div>
                            <div style={{flex: "1 1 auto", margin: "auto", order: 2, textAlign: "left"}}>
                                {this.renderMessage()}
                            </div>
                        </div>
                        <div style={{flex: "1 1 auto", order: 2, textAlign: "center", width: "100%"}}>
                            {this.props.isQueryCollapsed ?
                                <span onClick={() => this.props.onToggleQueryCollapsed()}>
                                    Show Search
                                </span> : null}
                        </div>
                    </div>
                    <div style={{flex: "0 0 auto", order: 3, width: "auto"}}>
                        {this.renderFloatCompartmentListGlyph()}
                    </div>
                </div>
            </div>
        );
    }

    public render() {

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
                {this.renderHeader()}
                <div style={{order: 2, flexGrow: 1, width: "100%", height: "100%"}}>
                    <TracingViewer {...this.props} ref={this.myRef}/>
                </div>
            </div>
        );
    }
}

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
