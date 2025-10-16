import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react";
import {Button, Message, Modal} from "semantic-ui-react";

import "../../../util/override.css";
import {fullRowStyle} from "../../../util/styles";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {NeuronListContainer} from "./NeuronListContainer";
import {ViewerContainer} from "./ViewerContainer";
import {Atlas} from "./atlas/Atlas";

export const MainView = observer(() => {
    const appLayout = useAppLayout();

    const [isExportMessageOpen, setIsExportMessageOpen] = useState<boolean>(false);

    const is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    // Navbar @ 79, fixed query header @ 40, and if expanded, query area at 300 => 119 or 419
    let offset = !appLayout.isQueryExpanded ? 119 : 419;

    if (is_chrome) {
        offset -= 0;
    }

    const baseStyle = {
        position: "fixed" as "fixed",
        zIndex: 200,
        top: offset + "px",
        height: "calc(100% - " + offset + "px)",
        backgroundColor: "#ffffffdd"
    };

    const neuronList = (<NeuronListContainer/>);

    const neuronListFloat = appLayout.isNeuronListOpen ? (<div style={baseStyle}>  {neuronList}</div>) : null;

    const compartmentListFloat = appLayout.isCompartmentListOpen ? (
        <div style={Object.assign({left: "calc(100% - 400px)"}, baseStyle)}>
            <Atlas/>
        </div>) : null;

    const compartmentListDock = appLayout.isCompartmentListDocked ? (
        <Atlas/>) : null;

    const overlay = neuronListFloat !== null || compartmentListFloat !== null ? (
        <div style={{
            width: "100%",
            position: "fixed",
            top: offset + "px",
            zIndex: 1,
            height: "calc(100% - " + offset + "px)",
            backgroundColor: "#000000",
            opacity: 0.1
        }} onClick={() => {
            appLayout.isNeuronListOpen = false;
            appLayout.isCompartmentListOpen = false;
        }}/>) : null;

    const style = {width: "100%", height: "100%"};

    return (
        <div style={style}>
            <Modal open={isExportMessageOpen} dimmer="blurring"
                   onClose={() => setIsExportMessageOpen(false)}>
                <Modal.Header content="Export Failed"/>
                <Modal.Content>
                    <Message error
                             content="There was an issue contacting the download server. The tracings were not downloaded."/>
                </Modal.Content>
                <Modal.Actions>
                    <Button content="Ok" onClick={() => setIsExportMessageOpen(false)}/>
                </Modal.Actions>
            </Modal>
            {neuronListFloat}
            {compartmentListFloat}
            {overlay}
            <div style={fullRowStyle}>
                {appLayout.isNeuronListDocked ? neuronList : null}
                <ViewerContainer/>
                {compartmentListDock}
            </div>
        </div>
    );
});
