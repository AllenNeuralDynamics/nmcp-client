import * as React from "react";
import {observer} from "mobx-react-lite";
import {Icon} from "semantic-ui-react";

import {primaryBackground, secondaryBackground} from "../../../../util/styles";
import {useAppLayout} from "../../../../hooks/useAppLayout";
import {DrawerState} from "../../../../viewmodel/appLayout";
import {StructureHistory} from "./StructureHistory";
import {AtlasTree} from "./AtlasTree";


const CompartmentHeader = () => {
    const appLayout = useAppLayout();

    const transform = appLayout.isCompartmentListDocked ? "" : "rotate(-45deg)";
    const state = appLayout.isCompartmentListDocked ? DrawerState.Float : DrawerState.Dock;

    return (
        <div style={{
            backgroundColor: primaryBackground,
            color: "white",
            height: "40px",
            minHeight: "40px",
            width: "100%",
            margin: 0,
            padding: "6px",
            display: "flex",
            order: 1,
            flexDirection: "row"
        }}>
            <h4 style={{
                color: "white",
                fontWeight: "lighter",
                margin: "auto",
                marginRight: "33px",
                textAlign: "center",
                flexGrow: 1,
                order: 3
            }}>Compartments</h4>
            <Icon name="pin" style={{margin: "auto", order: 2, marginLeft: "10px", transform: transform}}
                  onClick={() => appLayout.setAtlasStructureDrawerState(state)}/>
            <Icon name="chevron right" style={{margin: "auto", order: 1}}
                  onClick={() => appLayout.setAtlasStructureDrawerState(DrawerState.Hidden)}/>
        </div>
    );
};

export const Atlas = observer(() => {
    const color = secondaryBackground;

    const appLayout = useAppLayout();

    return (
        <div style={{
            backgroundColor: "#efefef",
            opacity: appLayout.isCompartmentListDocked ? 1.0 : 0.75,
            flexDirection: "column",
            flexWrap: "nowrap",
            alignItems: "flex-start",
            alignContent: "flex-start",
            order: 2,
            width: "400px",
            height: "100%",
            flexGrow: 0,
            flexShrink: 0,
            display: "flex",
            border: "1px solid"
        }}>
            <CompartmentHeader/>
            <div style={{order: 2, flexGrow: 1, width: "100%", overflow: "auto"}}>
                <div style={{display: "flex", backgroundColor: color, color: "white", margin: 0, padding: "8px"}}>
                    <h5 style={{color: "white", margin: "auto", textAlign: "center", order: 0, flexGrow: 1}}> History </h5>
                    <Icon style={{order: 1, flexGrow: 0, verticalAlign: "middle"}}
                          name={appLayout.isAtlasStructureHistoryExpanded ? "angle up" : "angle down"}
                          onClick={() => appLayout.isAtlasStructureHistoryExpanded = !appLayout.isAtlasStructureHistoryExpanded}/>
                </div>
                {appLayout.isAtlasStructureHistoryExpanded ? <StructureHistory/> : null}
                <div style={{backgroundColor: color, color: "white", margin: 0, padding: "8px"}}>
                    <h5 style={{color: "white", margin: "auto", textAlign: "center"}}>All Compartments</h5>
                </div>
                <AtlasTree/>
            </div>
        </div>
    );
});
