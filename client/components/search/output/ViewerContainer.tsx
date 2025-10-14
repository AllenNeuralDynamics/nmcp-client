import * as React from "react";
import {observer} from "mobx-react";
import {Icon} from "semantic-ui-react";

import {primaryBackground} from "../../../util/styles";
import {NeuroglancerProxy} from "../../../viewer/neuroglancerProxy";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {DrawerState} from "../../../viewmodel/appLayout";
import {TracingViewer} from "./TracingViewer";


export const ViewerContainer = observer(() => {
    const appLayout = useAppLayout();

    const renderFloatNeuronListGlyph = () => {
        if (!appLayout.isNeuronListDocked && !appLayout.isNeuronListOpen) {
            return (
                <div style={{display: "flex", alignItems: "center", height: "100%"}}
                     onClick={() => appLayout.setNeuronDrawerState(DrawerState.Float)}>
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
        if (!appLayout.isCompartmentListDocked && !appLayout.isCompartmentListOpen) {
            return (
                <div style={{display: "flex", alignItems: "center", height: "100%"}}
                     onClick={() => appLayout.setAtlasStructureDrawerState(DrawerState.Float)}>
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
        return (<Icon name={appLayout.isQueryExpanded ? "chevron up" : "chevron down"}
                      style={{margin: "auto", order: 3}}
                      onClick={() => appLayout.isQueryExpanded = !appLayout.isQueryExpanded}/>)
    };

    const renderResetView = () => {
        return (
            <span style={{marginRight: "6px", textDecoration: "underline"}} onClick={() => {
                if (NeuroglancerProxy.SearchNeuroglancer) {
                    NeuroglancerProxy.SearchNeuroglancer.resetView();
                }
            }}>Reset View</span>
        );
    }

    const renderHeader = () => {
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
                        <div style={{flex: "1 1 auto", order: 2, textAlign: "center", width: "100%"}}>
                            {!appLayout.isQueryExpanded ?
                                <span onClick={() => appLayout.isQueryExpanded = !appLayout.isQueryExpanded}>
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
                <TracingViewer/>
            </div>
        </div>
    );
});
