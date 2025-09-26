import * as React from "react";
import {Dropdown, Icon, List, MenuItem, Popup} from "semantic-ui-react";

import {ITracingNode} from "../../models/tracingNode";
import {StructureIdentifier} from "../../models/structureIdentifier";
import {IPositionInput} from "../../models/queryFilter";
import {TracingViewModel} from "../../viewmodel/tracingViewModel";
import {TracingStructure} from "../../models/tracingStructure";
import {IBrainArea} from "../../models/brainArea";
import {HighlightSelectionMode} from "./TracingViewer";
import {NeuronViewModel} from "../../viewmodel/neuronViewModel";
import {NEURON_VIEW_MODES, NeuronViewMode} from "../../viewmodel/neuronViewMode";
import {UserPreferences} from "../../util/userPreferences";
import {useContext, useReducer, useRef, useState} from "react";
import {ConstantsContext} from "../app/AppConstants";

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

function ActiveTracingItemList(props: IActiveTracingItemProps) {
    const onViewModeChange = (viewMode: NeuronViewMode) => {
        props.onChangeNeuronViewMode(props.viewModel, viewMode);
    };

    const n = props.viewModel;

    const viewMode = n.CurrentViewMode.structure;

    const soma = n.somaOnlyTracing.soma;

    let somaBrainAreaLabel = null;

    if (soma) {
        const somaBrainArea = props.lookupBrainArea(soma.brainStructureId);

        if (somaBrainArea) {
            let somaDisplayBrainArea = somaBrainArea;

            while (!somaDisplayBrainArea.geometryEnable) {
                somaDisplayBrainArea = props.lookupBrainArea(somaDisplayBrainArea.parentStructureId);
            }

            const somaBrainAreaTrigger = <a onClick={() => props.onToggleLoadedGeometry(somaBrainArea.id)}>
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
        return (<MenuItem key={o.id} onClick={() => onViewModeChange(o)}>{o.id}</MenuItem>);
        // return (<MenuItem key={o.id} eventKey={o}>{o.id}</MenuItem>);
    });

    return (
        <List.Item active={props.isSelected}>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <div style={{flex: "1 1 auto", order: 1}} onClick={() => props.onSetHighlightedNeuron(n)}>
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
                      onClick={() => props.onRemoveFromHistory(n)}/>
            </div>
        </List.Item>
    )
}

interface IViewerSelectionProps {
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

export const ViewerSelection = (props: IViewerSelectionProps) => {
    const [isCenterPointCollapsed, setIsCenterPointCollapsed] = useState<boolean>(false);
    const [isActiveTracingsVisible, setIsActiveTracingsVisible] = useState<boolean>(true);
    const [top, setTop] = useState<number>(10);
    const [left, setLeft] = useState<number>(10);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const isTrackingRef = useRef<boolean>(false);
    const startTopRef = useRef<number>(0);
    const startLeftRef = useRef<number>(0);
    const startMouseRef = useRef<{x: number, y: number}>({x: 0, y: 0});
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const constants = useContext(ConstantsContext);

    React.useEffect(() => {
        const preferenceChanged = (name: string) => {
            if (name === "viewerMeshVersion") {
                forceUpdate();
            }
        };

        UserPreferences.Instance.addListener({ preferenceChanged });

        return () => {
            UserPreferences.Instance.removeListener({ preferenceChanged });
        };
    }, []);

    const lookupStructureIdentifier = (id: string) => {
        return constants.findStructureIdentifier(id);
    };

    const lookupBrainArea = (id: string | number) => {
        return constants.findBrainArea(id);
    };

    const renderSelection = () => {
        const node = props.selectedNode;

        const brainArea = lookupBrainArea(node.brainStructureId);

        let displayBrainArea = brainArea;

        if (displayBrainArea) {
            while (!displayBrainArea.geometryEnable) {
                displayBrainArea = lookupBrainArea(displayBrainArea.parentStructureId);
            }
        }

        let structureName = "path";

        const structure = lookupStructureIdentifier(node.structureIdentifierId);

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

        if (structure.value !== StructureIdentifier.soma && props.selectedTracing && props.selectedTracing.soma) {
            const somaBrainArea = lookupBrainArea(props.selectedTracing.soma.brainStructureId);

            let somaDisplayBrainArea = somaBrainArea;

            if (somaDisplayBrainArea) {
                while (!somaDisplayBrainArea.geometryEnable) {
                    somaDisplayBrainArea = lookupBrainArea(somaDisplayBrainArea.parentStructureId);
                }
            }

            const somaBrainAreaTrigger = somaBrainArea ? (
                <a onClick={() => props.onToggleLoadedGeometry(somaBrainArea.id)}>
                    {` ${somaBrainArea.acronym}`}
                </a>
            ) : null;

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

        const nodeBrainAreaTrigger = displayBrainArea ? (
            <a onClick={() => props.onToggleLoadedGeometry(displayBrainArea.id)}>
                {`${brainArea.acronym}`}
            </a>
        ) : null;

        const nodeBrainAreaPopup = brainArea ? (
            <Popup trigger={nodeBrainAreaTrigger} style={{maxHeight: "30px"}}>{brainArea.name}</Popup>
        ) : null;

        return (
            <div style={{display: "flex", flexFlow: "column nowrap"}}>
                <div style={{order: 1, display: "flex", flexFlow: "row nowrap"}}>
                    <div style={{order: 1}}>
                        <strong>Neuron:</strong>{` ${props.selectedTracing.neuron.neuron.idString}`}
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
                    <a onClick={() => props.populateCustomPredicate(position, true)}>
                        replace
                    </a>
                    {` or `}
                    <a onClick={() => props.populateCustomPredicate(position, false)}>
                        add
                    </a>
                </div>
            </div>
        );
    };

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        isTrackingRef.current = true;
        startLeftRef.current = left;
        startTopRef.current = top;
        startMouseRef.current = {x: e.clientX, y: e.clientY};
    };

    const onMouseUp = () => {
        isTrackingRef.current = false;
        setIsDragging(false);
    };

    const onMouseMove = (evt: React.MouseEvent) => {
        if (isTrackingRef.current) {
            evt.preventDefault();
            evt.stopPropagation();

            setTop(Math.max(startTopRef.current + (evt.clientY - startMouseRef.current.y), 0));
            setLeft(Math.max(startLeftRef.current + (evt.clientX - startMouseRef.current.x), 0));
        }
    };

    const renderActiveTracings = () => {
        if (props.activeNeurons.length === 0 && !props.displayHighlightedOnly) {
            return null;
        }

        const iconName = isActiveTracingsVisible ? "chevron up" : "chevron down";

        const displayIcon = props.displayHighlightedOnly ? "eye slash" : "eye";

        const rows: any = props.activeNeurons.map(n => {
            return (<ActiveTracingItemList key={`an_${n.Id}`} viewModel={n}
                                           isSelected={props.highlightSelectionMode === HighlightSelectionMode.Cycle && n.Id === props.cycleFocusNeuronId}
                                           lookupBrainArea={(t) => lookupBrainArea(t)}
                                           onChangeNeuronViewMode={props.onChangeNeuronViewMode}
                                           onToggleTracing={props.onToggleTracing}
                                           onToggleLoadedGeometry={props.onToggleLoadedGeometry}
                                           onSetHighlightedNeuron={props.onSetHighlightedNeuron}
                                           onRemoveFromHistory={props.onRemoveActiveTracing}/>)
        });

        let leftCommands = null;

        if (props.highlightSelectionMode === HighlightSelectionMode.Normal) {
            leftCommands = (
                <div style={{order: 1, flex: "0 0 auto"}}>
                    <Icon name={displayIcon}
                          style={{margin: "auto", marginLeft: "4px", marginRight: "4px", paddingTop: "2px"}}
                          onClick={() => props.onToggleLimitToHighlighted()}/>
                    <Icon name="exchange"
                          style={{margin: "auto", marginLeft: "4px", marginRight: "4px", paddingTop: "2px"}}
                          onClick={() => props.onChangeHighlightMode()}/>
                </div>
            );

        } else {
            leftCommands = (
                <div style={{order: 1, flex: "0 0 auto"}}>
                    <Icon name="triangle left"
                          style={{margin: "auto", marginLeft: "4px", marginRight: "4px", paddingTop: "2px"}}
                          onClick={() => props.onCycleHighlightNeuron(-1)}/>
                    <Icon name="triangle right"
                          style={{margin: "auto", marginLeft: "4px", marginRight: "4px", paddingTop: "2px"}}
                          onClick={() => props.onCycleHighlightNeuron(1)}/>
                    <Icon name="remove"
                          style={{margin: "auto", marginLeft: "8px", marginRight: "4px", paddingTop: "2px"}}
                          onClick={() => props.onChangeHighlightMode()}/>
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
                              onClick={() => setIsActiveTracingsVisible(!isActiveTracingsVisible)}/>
                    </div>
                </div>
                {isActiveTracingsVisible ?
                    <div style={{order: 2}}>
                        <List>
                            {rows}
                        </List>
                    </div> : null}
            </div>
        );
    };

    const renderPalette = () => {
        if (!props.selectedNode) {
            return;
        }

        const iconName = isCenterPointCollapsed ? "chevron down" : "chevron up";

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
                              onClick={() => setIsCenterPointCollapsed(!isCenterPointCollapsed)}/>
                    </div>
                </div>
                {!isCenterPointCollapsed ?
                    <div style={{order: 2, padding: "4px"}}>
                        {renderSelection()}
                    </div> : null}
            </div>
        )
    };

    const content1 = renderPalette();
    const content2 = renderActiveTracings();

    if (!content1 && !content2) {
        return null;
    }

    return (
        <div className={isDragging ? "no-select" : ""} style={{
            backgroundColor: "#efefef",
            height: "auto",
            position: "absolute",
            top: top + "px",
            left: left + "px",
            width: "auto",
            opacity: 0.9,
            border: "1px solid",
            zIndex: 1000
        }} onMouseDown={(e) => onMouseDown(e)} onMouseUp={() => onMouseUp()}
             onMouseMove={(evt) => onMouseMove(evt)}>
            {content1}
            {content2}
        </div>
    );
}
