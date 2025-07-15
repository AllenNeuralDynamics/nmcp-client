import * as React from "react";
import { useCallback } from "react";
import {Dropdown, Icon, Message} from "semantic-ui-react";

import {INeuronTableProps, NeuronTable} from "./NeuronTable";
import {DrawerState} from "./MainView";
import {QueryStatus} from "../query/QueryHeader";
import {primaryBackground} from "../../util/styles";
import {ExportFormat} from "../../models/tracing";

interface INeuronListContainerProps extends INeuronTableProps {
    isDocked: boolean;
    queryStatus: QueryStatus;
    exportLimit: number;

    onClickCloseOrPin(state: DrawerState): void;
    onRequestExport(format: ExportFormat): void;
}

export const NeuronListContainer: React.FC<INeuronListContainerProps> = (props) => {

    const renderCloseGlyph = useCallback(() => {
        const transform = props.isDocked ? "" : "rotate(-45deg)";
        const state = props.isDocked ? DrawerState.Float : DrawerState.Dock;

        return (
            <Icon name="pin" style={{margin: "auto", order: 3, marginRight: "10px", transform: transform}}
                  onClick={() => props.onClickCloseOrPin(state)}/>
        );
    }, [props.isDocked, props.onClickCloseOrPin]);

    const renderExport = useCallback(() => {
        const count = props.neuronViewModels.reduce((c, n) => {
            return n.isSelected ? c + 1 : c
        }, 0);

        let options = null;

        if (count <= props.exportLimit) {
            options = [
                <Dropdown.Item key="1" text="Export SWC" onClick={() => props.onRequestExport(ExportFormat.SWC)}/>,
                <Dropdown.Item key="2" text="Export JSON"
                               onClick={() => props.onRequestExport(ExportFormat.JSON)}/>
            ];
        } else {
            options = [
                <Message key="3" error content={`Please select ${props.exportLimit} or fewer tracings to export`}/>
            ];
        }

        return <Dropdown inline compact={true} trigger={<Icon name="download"/>} value={null} disabled={count === 0}
                         style={{paddingTop: "6px"}}>
            <Dropdown.Menu>
                {options}
            </Dropdown.Menu>
        </Dropdown>
    }, [props.neuronViewModels, props.exportLimit, props.onRequestExport]);

    const renderHeader = useCallback(() => {
        return (
            <div style={{
                backgroundColor: primaryBackground,
                color: "white",
                maxHeight: "40px",
                minHeight: "40px",
                width: "100%",
                margin: 0,
                padding: "6px",
                display: "flex",
                order: 1,
                flexDirection: "row"
            }}>
                {renderExport()}
                <h4 style={{
                    color: "white",
                    fontWeight: "lighter",
                    margin: "auto",
                    marginLeft: "33px",
                    textAlign: "center",
                    flexGrow: 1,
                    order: 2
                }}>Neurons</h4>
                {renderCloseGlyph()}
                <Icon name="chevron left" style={{margin: "auto", order: 4}}
                      onClick={() => props.onClickCloseOrPin(DrawerState.Hidden)}/>
            </div>
        );
    }, [renderExport, renderCloseGlyph, props.onClickCloseOrPin]);

    let content = null;

    if (props.queryStatus === QueryStatus.NeverQueried) {
        content = (
            <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>Perform a query to view
                matching neurons</h5>);
    } else if (props.queryStatus === QueryStatus.Loading) {
        if (props.neuronViewModels.length === 0) {
            content = (
                <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>Loading</h5>);
        } else {
            content = (<NeuronTable {...props}/>);
        }
    } else {
        if (props.neuronViewModels.length === 0) {
            content = (
                <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>No neurons
                    found</h5>);
        } else {
            content = (<NeuronTable {...props}/>);
        }
    }

    return (
        <div style={{
            backgroundColor: "#efefef",
            opacity: props.isDocked ? 1.0 : 0.75,
            flexDirection: "column",
            flexWrap: "nowrap",
            order: 1,
            width: "500px",
            minWidth: "500px",
            height: "100%",
            flexGrow: 0,
            flexShrink: 0,
            display: "flex",
            border: "1px solid"
        }}>
            {renderHeader()}
            <div style={{order: 2, flexGrow: 1, width: "100%", overflow: "auto"}}>
                {content}
            </div>
        </div>
    );
};
