import * as React from "react";
import {useCallback} from "react";
import {observer} from "mobx-react";
import {Dropdown, Icon, Message} from "semantic-ui-react";
import {toast} from "react-toastify";

import {primaryBackground} from "../../../util/styles";
import {requestExport} from "../../../services/exportService";
import {DrawerState} from "../../../viewmodel/appLayout";
import {useSystemConfiguration} from "../../../hooks/useSystemConfiguration";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";
import {NeuronTable} from "./NeuronTable";
import {ExportFormat} from "../../../models/tracing";
import {QueryStatus} from "../../../viewmodel/queryResponseViewModel";

export const NeuronListContainer = observer(() => {
    const systemConfiguration = useSystemConfiguration();
    const appLayout = useAppLayout();

    const queryResponse = useQueryResponseViewModel();

    const renderCloseGlyph = useCallback(() => {
        const transform = appLayout.isNeuronListDocked ? "" : "rotate(-45deg)";
        const state = appLayout.isNeuronListDocked ? DrawerState.Float : DrawerState.Dock;

        return (
            <Icon name="pin" style={{margin: "auto", order: 3, marginRight: "10px", transform: transform}}
                  onClick={() => appLayout.setNeuronDrawerState(state)}/>
        );
    }, [appLayout.isNeuronListDocked]);

    async function exportNeurons(ids: string[], format: ExportFormat) {
        if (ids.length === 0) {
            return;
        }

        if (await requestExport(ids, format)) {
            toast.info("Export requested.  A download will being when the data is ready.", {autoClose: 2500});
        } else {
            // TODO error toast
        }
    }

    const neurons = queryResponse.neuronViewModels.filter(v => v.isSelected);

    const count = neurons.length;

    let options: React.JSX.Element[];

    if (count <= systemConfiguration.exportLimit) {
        const ids = neurons.map(n => n.neuron.id);

        options = [
            <Dropdown.Item key="1" text="Export SWC" onClick={() => exportNeurons(ids, ExportFormat.SWC)}/>,
            <Dropdown.Item key="2" text="Export JSON" onClick={() => exportNeurons(ids, ExportFormat.JSON)}/>
        ];
    } else {
        options = [
            <Message key="3" error content={`Please select ${systemConfiguration.exportLimit} or fewer tracings to export`}/>
        ];
    }

    const renderedExport = (<Dropdown inline compact={true} trigger={<Icon name="download"/>} value={null} disabled={count === 0} style={{paddingTop: "6px"}}>
        <Dropdown.Menu>
            {options}
        </Dropdown.Menu>
    </Dropdown>)

    const renderedHeader = (
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
            {renderedExport}
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
                  onClick={() => appLayout.setNeuronDrawerState(DrawerState.Hidden)}/>
        </div>
    );

    let content: React.JSX.Element;

    if (queryResponse.status === QueryStatus.NeverQueried) {
        content = (
            <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>Perform a query to view
                matching neurons</h5>);
    } else if (queryResponse.status === QueryStatus.Loading) {
        if (queryResponse.neuronViewModels.length === 0) {
            content = (
                <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>Loading</h5>);
        } else {
            content = (<NeuronTable/>);
        }
    } else {
        if (queryResponse.neuronViewModels.length === 0) {
            content = (
                <h5 style={{textAlign: "center", verticalAlign: "middle", marginTop: "40px"}}>No neurons
                    found</h5>);
        } else {
            content = (<NeuronTable/>);
        }
    }

    return (
        <div style={{
            backgroundColor: "#efefef",
            opacity: appLayout.isNeuronListDocked ? 1.0 : 0.75,
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
            {renderedHeader}
            <div style={{order: 2, flexGrow: 1, width: "100%", overflow: "auto"}}>
                {content}
            </div>
        </div>
    );
});
