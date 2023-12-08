import * as React from "react";
import {Dropdown, Icon, List, MenuItem, Popup} from "semantic-ui-react";

import {ITracingNode} from "../../models/tracingNode";
import {StructureIdentifier} from "../../models/structureIdentifier";
import {IPositionInput} from "../../models/queryFilter";
import {NdbConstants} from "../../models/constants";
import {TracingViewModel} from "../../viewmodel/tracingViewModel";
import {TracingStructure} from "../../models/tracingStructure";
import {IBrainArea} from "../../models/brainArea";
import {HighlightSelectionMode} from "./TracingViewer";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {NEURON_VIEW_MODES, NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {INotificationListener, PreferencesManager} from "../../util/preferencesManager";
import {ViewerMeshVersion} from "../../models/compartmentMeshSet";

interface IActiveTracingItemProps {
    viewModel: NeuronViewModel;
    isSelected: boolean;

    lookupBrainArea(id: string | number): IBrainArea;
    onRemoveFromHistory(neuron: NeuronViewModel): void;
    onToggleLoadedGeometry(id: string): void;
    onToggleTracing(id: string): void;
    onSetHighlightedNeuron(neuron: NeuronViewModel): void;
    onChangeNeuronViewMode(neuron: NeuronViewModel, viewMode: NeuronViewMode): void;
}

class ActiveTracingItemList extends React.Component<IActiveTracingItemProps, {}> {
    private onViewModeChange(viewMode: NeuronViewMode) {
        this.props.onChangeNeuronViewMode(this.props.viewModel, viewMode);
    }

    public render() {
        const n = this.props.viewModel;

        const viewMode = n.CurrentViewMode.structure;

        const soma = n.somaOnlyTracing.soma;

        let somaBrainAreaLabel = null;

        if (soma) {
            const somaBrainArea = this.props.lookupBrainArea(PreferencesManager.Instance.ViewerMeshVersion === ViewerMeshVersion.Janelia ? soma.brainAreaIdCcfV25 : soma.brainAreaIdCcfV30);

            if (somaBrainArea) {
                let somaDisplayBrainArea = somaBrainArea;

                while (!somaDisplayBrainArea.geometryEnable) {
                    somaDisplayBrainArea = this.props.lookupBrainArea(somaDisplayBrainArea.parentStructureId);
                }

                const somaBrainAreaTrigger = <a onClick={() => this.props.onToggleLoadedGeometry(somaBrainArea.id)}>
                    {` ${somaBrainArea.acronym}`}
                </a>;

                somaBrainAreaLabel = (
                    <Popup trigger={somaBrainAreaTrigger}
                           style={{maxHeight: "30px"}}>{somaDisplayBrainArea.name}</Popup>
                );
            }
        }

        let structureLabel = " - (soma only)";

        // If not highlighted is the proxy tracing for showing just the soma.
        if (viewMode !== TracingStructure.soma) {
            structureLabel = "";
        }

        const options = NEURON_VIEW_MODES.slice();

        if (!n.hasDendriteTracing) {
            options.splice(2, 1);
        }

        if (!n.hasAxonTracing) {
            options.splice(1, 1);
        }

        if (options.length < 4) {
            options.splice(0, 1);
        }

        const menus = options.map(o => {
            return (<MenuItem key={o.id} onClick={() => this.onViewModeChange(o)}>{o.id}</MenuItem>);
            // return (<MenuItem key={o.id} eventKey={o}>{o.id}</MenuItem>);
        });

        return (
            <List.Item active={this.props.isSelected}>
                <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <div style={{flex: "1 1 auto", order: 1}} onClick={() => this.props.onSetHighlightedNeuron(n)}>
                        {`${n.neuron.idString}${structureLabel} `}
                    </div>

                    {n.RequestedViewMode === null ? <Dropdown options={menus} trigger={n.CurrentViewMode.id} style={{
                            flex: "0 0 auto",
                            order: 2,
                            width: "80px",
                            textAlign: "left"
                        }}/>
                        : <div style={{flex: "0 0 auto", order: 2, width: "80px"}}>Loading...</div>}
                    <div style={{flex: "0 0 auto", order: 3, paddingRight: "10px"}}>
                        {somaBrainAreaLabel}
                    </div>
                    <Icon name="remove" className="pull-right"
                          style={{flex: "0 0 auto", order: 4, marginBottom: "4px"}}
                          onClick={() => this.props.onRemoveFromHistory(n)}/>
                </div>
            </List.Item>
        )
    }
}

interface IViewerSelectionProps {
    constants: NdbConstants;

    selectedTracing: TracingViewModel;
    selectedNode: ITracingNode;
    activeNeurons: NeuronViewModel[];
    displayHighlightedOnly: boolean;
    highlightSelectionMode: HighlightSelectionMode;
    cycleFocusNeuronId: string;

    onRemoveActiveTracing(n: NeuronViewModel): void;
    onToggleLoadedGeometry(id: string): void;
    onToggleTracing(id: string): void;
    onToggleLimitToHighlighted(): void;
    onChangeHighlightMode(): void;
    onSetHighlightedNeuron(neuron: NeuronViewModel): void;
    onCycleHighlightNeuron(direction: number): void;
    populateCustomPredicate(position: IPositionInput, replace: boolean): void;
    onChangeNeuronViewMode(neuron: NeuronViewModel, viewMode: NeuronViewMode): void;
}

interface IViewerSelectionState {
    isCenterPointCollapsed?: boolean;
    isActiveTracingsVisible?: boolean;
    top?;
    left?;
    isDragging?;
}

export class ViewerSelection extends React.Component<IViewerSelectionProps, IViewerSelectionState> implements INotificationListener {
    private _isTracking = false;
    private _startTop;
    private _startLeft;
    private _startMouse;

    public constructor(props: IViewerSelectionProps) {
        super(props);

        this.state = {
            isCenterPointCollapsed: false,
            isActiveTracingsVisible: true,
            top: 10,
            left: 10,
            isDragging: false
        }

        PreferencesManager.Instance.addListener(this);
    }

    public preferenceChanged(name: string) {
        if (name === "viewerMeshVersion") {
            this.forceUpdate();
        }
    }

    private lookupStructureIdentifier(id: string) {
        return this.props.constants.findStructureIdentifier(id);
    }

    private lookupBrainArea(id: string | number) {
        return this.props.constants.findBrainArea(id);
    }

    public renderSelection() {
        const node = this.props.selectedNode;

        const brainArea = this.lookupBrainArea(PreferencesManager.Instance.ViewerMeshVersion === ViewerMeshVersion.Janelia ? node.brainAreaIdCcfV25 : node.brainAreaIdCcfV30);

        let displayBrainArea = brainArea;

        if (displayBrainArea) {
            while (!displayBrainArea.geometryEnable) {
                displayBrainArea = this.lookupBrainArea(displayBrainArea.parentStructureId);
            }
        }

        let structureName = "path";

        const structure = this.lookupStructureIdentifier(node.structureIdentifierId);

        switch (structure.value) {
            case StructureIdentifier.forkPoint:
                structureName = "branch";
                break;
            case StructureIdentifier.endPoint:
                structureName = "end point";
                break;
            case StructureIdentifier.soma:
                structureName = "Soma";
                break;
        }

        const position = {
            x: node.x,
            y: node.y,
            z: node.z
        };

        const label = structure.value === StructureIdentifier.soma ? "Soma brain area:" : "Node brain area:";

        let somaBrainAreaLabel = null;

        if (structure.value !== StructureIdentifier.soma && this.props.selectedTracing && this.props.selectedTracing.soma) {
            const somaBrainArea = this.lookupBrainArea(PreferencesManager.Instance.ViewerMeshVersion === ViewerMeshVersion.Janelia ? this.props.selectedTracing.soma.brainAreaIdCcfV25 : this.props.selectedTracing.soma.brainAreaIdCcfV30);

            let somaDisplayBrainArea = somaBrainArea;

            if (somaDisplayBrainArea) {
                while (!somaDisplayBrainArea.geometryEnable) {
                    somaDisplayBrainArea = this.lookupBrainArea(somaDisplayBrainArea.parentStructureId);
                }
            }

            const somaBrainAreaTrigger = somaBrainArea ? (
                <a onClick={() => this.props.onToggleLoadedGeometry(somaBrainArea.id)}>
                    {` ${somaBrainArea.acronym}`}
                </a>
            ): null;

            const somaBrainAreaPopup = somaBrainArea ? (
                <Popup trigger={somaBrainAreaTrigger} style={{maxHeight: "30px"}}>{somaDisplayBrainArea.name}</Popup>
            ) : null;

            somaBrainAreaLabel = (
                <span>
                    <strong>
                        Soma brain area:
                    </strong>
                    {somaBrainAreaPopup}
                </span>
            );
        }

        const nodeBrainAreaTrigger = displayBrainArea ?  (
            <a onClick={() => this.props.onToggleLoadedGeometry(displayBrainArea.id)}>
                {`${brainArea.acronym}`}
            </a>
        ) : null;

        const nodeBrainAreaPopup = brainArea ?  (
            <Popup trigger={nodeBrainAreaTrigger} style={{maxHeight: "30px"}}>{brainArea.name}</Popup>
        ) : null;

        return (
            <div style={{display: "flex", flexFlow: "column nowrap"}}>
                <div style={{order: 1, display: "flex", flexFlow: "row nowrap"}}>
                    <div style={{order: 1}}>
                        <strong>Neuron:</strong>{` ${this.props.selectedTracing.neuron.neuron.idString}`}
                        <br/>
                        <strong>{`${label} `}</strong>
                        {nodeBrainAreaPopup}
                        <br/>
                        {somaBrainAreaLabel}
                    </div>
                    <div style={{order: 2, flex: "1 1 0"}}/>
                    <div style={{order: 3, paddingLeft: "20px"}}>
                        <strong>x:</strong>{` ${node.x.toFixed(1)}`}<br/>
                        <strong>y:</strong>{` ${node.y.toFixed(1)}`}<br/>
                        <strong>z:</strong>{` ${node.z.toFixed(1)}`}
                    </div>
                </div>
                <div style={{order: 2, marginTop: "4px", paddingTop: "4px", borderTop: "1px solid #ddd"}}>
                    <strong>{`Update filter with custom region: `}</strong>
                    <a onClick={() => this.props.populateCustomPredicate(position, true)}>
                        replace
                    </a>
                    {` or `}
                    <a onClick={() => this.props.populateCustomPredicate(position, false)}>
                        add
                    </a>
                </div>
            </div>
        );
    }

    private onMouseDown(e) {
        this.setState({isDragging: true});
        this._isTracking = true;
        this._startLeft = this.state.left;
        this._startTop = this.state.top;
        this._startMouse = {x: e.clientX, y: e.clientY};
    }

    private onMouseUp() {
        this._isTracking = false;
        this.setState({isDragging: false});
    }

    private onMouseMove(evt) {
        if (this._isTracking) {
            evt.preventDefault();
            evt.stopPropagation();

            this.setState({
                top: Math.max(this._startTop + (evt.clientY - this._startMouse.y), 0),
                left: Math.max(this._startLeft + (evt.clientX - this._startMouse.x), 0)
            });
        }
    }

    private renderActiveTracings() {
        if (this.props.activeNeurons.length === 0 && !this.props.displayHighlightedOnly) {
            return null;
        }

        const iconName = this.state.isActiveTracingsVisible ? "chevron up" : "chevron down";

        const displayIcon = this.props.displayHighlightedOnly ? "eye slash" : "eye";

        const rows: any = this.props.activeNeurons.map(n => {
            return (<ActiveTracingItemList key={`an_${n.Id}`} viewModel={n}
                                           isSelected={this.props.highlightSelectionMode === HighlightSelectionMode.Cycle && n.Id === this.props.cycleFocusNeuronId}
                                           lookupBrainArea={(t) => this.lookupBrainArea(t)}
                                           onChangeNeuronViewMode={this.props.onChangeNeuronViewMode}
                                           onToggleTracing={this.props.onToggleTracing}
                                           onToggleLoadedGeometry={this.props.onToggleLoadedGeometry}
                                           onSetHighlightedNeuron={this.props.onSetHighlightedNeuron}
                                           onRemoveFromHistory={this.props.onRemoveActiveTracing}/>)
        });

        let leftCommands = null;

        if (this.props.highlightSelectionMode === HighlightSelectionMode.Normal) {
            leftCommands = (
                <div style={{order: 1, flex: "0 0 auto"}}>
                    <Icon name={displayIcon}
                          style={{margin: "auto", marginLeft: "4px", marginRight: "4px", paddingTop: "2px"}}
                          onClick={() => this.props.onToggleLimitToHighlighted()}/>
                    <Icon name="exchange"
                          style={{margin: "auto", marginLeft: "4px", marginRight: "4px", paddingTop: "2px"}}
                          onClick={() => this.props.onChangeHighlightMode()}/>
                </div>
            );

        } else {
            leftCommands = (
                <div style={{order: 1, flex: "0 0 auto"}}>
                    <Icon name="triangle left"
                          style={{margin: "auto", marginLeft: "4px", marginRight: "4px", paddingTop: "2px"}}
                          onClick={() => this.props.onCycleHighlightNeuron(-1)}/>
                    <Icon name="triangle right"
                          style={{margin: "auto", marginLeft: "4px", marginRight: "4px", paddingTop: "2px"}}
                          onClick={() => this.props.onCycleHighlightNeuron(1)}/>
                    <Icon name="remove"
                          style={{margin: "auto", marginLeft: "8px", marginRight: "4px", paddingTop: "2px"}}
                          onClick={() => this.props.onChangeHighlightMode()}/>
                </div>
            );
        }

        return (
            <div style={{display: "flex", flexFlow: "column nowrap", minWidth: "300px"}}>
                <div style={{
                    display: "flex",
                    flexFlow: "row nowrap",
                    backgroundColor: "#ccc",
                    borderBottom: "1px solid #aaa"
                }}>
                    {leftCommands}
                    <h5 style={{
                        order: 2,
                        flex: "1 1 0",
                        textAlign: "center",
                        color: "white",
                        padding: "4px",
                        margin: 0
                    }}>
                        Selected Tracings
                    </h5>
                    <div style={{order: 3, flex: "0 0 auto"}}>
                        <Icon name={iconName}
                              style={{margin: "auto", marginLeft: "4px", marginRight: "4px", paddingTop: "2px"}}
                              onClick={() => this.setState({isActiveTracingsVisible: !this.state.isActiveTracingsVisible})}/>
                    </div>
                </div>
                {this.state.isActiveTracingsVisible ?
                    <div style={{order: 2}}>
                        <List>
                            {rows}
                        </List>
                    </div> : null}
            </div>
        );
    }

    private renderPalette() {
        if (!this.props.selectedNode) {
            return;
        }

        const iconName = this.state.isCenterPointCollapsed ? "chevron down" : "chevron up";

        return (
            <div style={{display: "flex", flexFlow: "column nowrap", minWidth: "300px"}}>
                <div style={{
                    display: "flex",
                    flexFlow: "row nowrap",
                    backgroundColor: "#ccc",
                    borderBottom: "1px solid #aaa"
                }}>
                    <h5 style={{
                        order: 1,
                        flex: "1 1 0",
                        textAlign: "center",
                        color: "white",
                        padding: "4px",
                        margin: 0
                    }}>
                        Center Point
                    </h5>
                    <div style={{order: 2, flex: "0 0 auto"}}>
                        <Icon name={iconName} style={{margin: "auto", marginRight: "4px", paddingTop: "2px"}}
                              onClick={() => this.setState({isCenterPointCollapsed: !this.state.isCenterPointCollapsed})}/>
                    </div>
                </div>
                {!this.state.isCenterPointCollapsed ?
                    <div style={{order: 2, padding: "4px"}}>
                        {this.renderSelection()}
                    </div> : null}
            </div>
        )
    }

    public render() {
        const content1 = this.renderPalette();
        const content2 = this.renderActiveTracings();

        if (!content1 && !content2) {
            return null;
        }

        return (
            <div className={this.state.isDragging ? "no-select" : ""} style={{
                backgroundColor: "#efefef",
                height: "auto",
                position: "absolute",
                top: this.state.top + "px",
                left: this.state.left + "px",
                width: "auto",
                opacity: 0.9,
                border: "1px solid"
            }} onMouseDown={(e) => this.onMouseDown(e)} onMouseUp={() => this.onMouseUp()}
                 onMouseMove={(evt) => this.onMouseMove(evt)}>
                {content1}
                {content2}
            </div>
        );
    }
}
