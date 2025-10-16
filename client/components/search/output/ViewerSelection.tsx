import * as React from "react";
import {useRef, useState} from "react";
import {Icon, Popup} from "semantic-ui-react";

import {useConstants} from "../../../hooks/useConstants";
import {useAtlas} from "../../../hooks/useAtlas";
import {ITracingNode} from "../../../models/tracingNode";
import {StructureIdentifier} from "../../../models/structureIdentifier";
import {TracingViewModel} from "../../../viewmodel/tracingViewModel";
import {observer} from "mobx-react";
import {useUIQuery} from "../../../hooks/useUIQuery";
import {useAppLayout} from "../../../hooks/useAppLayout";

interface IViewerSelectionProps {
    selectedTracing: TracingViewModel;
    selectedNode: ITracingNode;
}

export const ViewerSelection = observer<React.FC<IViewerSelectionProps>>((props: IViewerSelectionProps) => {
    const [isCenterPointCollapsed, setIsCenterPointCollapsed] = useState<boolean>(false);
    const [top, setTop] = useState<number>(10);
    const [left, setLeft] = useState<number>(10);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const isTrackingRef = useRef<boolean>(false);
    const startTopRef = useRef<number>(0);
    const startLeftRef = useRef<number>(0);
    const startMouseRef = useRef<{ x: number, y: number }>({x: 0, y: 0});

    const constants = useConstants();
    const appLayout = useAppLayout();
    const uiQuery = useUIQuery();
    const atlas = useAtlas();

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

        const structure = lookupStructureIdentifier(node.structureIdentifierId);

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
                <a onClick={() => atlas.toggle(somaBrainArea.id)}>
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
            <a onClick={() => atlas.toggle(displayBrainArea.id)}>
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
                    <a onClick={() => {
                        uiQuery.createCustomRegionPredicate(position, true);
                        appLayout.isQueryExpanded = true;
                    }}>
                        replace
                    </a>
                    {` or `}
                    <a onClick={() => {
                        uiQuery.createCustomRegionPredicate(position, false);
                        appLayout.isQueryExpanded = true;
                    }}>
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

    if (!content1) {
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
        </div>
    );
});
