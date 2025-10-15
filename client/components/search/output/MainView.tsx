import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react";
import {Button, Message, Modal} from "semantic-ui-react";

import "../../../util/override.css";
import {IPositionInput} from "../../../viewmodel/filterContents";
import {INeuronListContainerProps, NeuronListContainer} from "./NeuronListContainer";
import {IViewerProps, ViewerContainer} from "./ViewerContainer";
import {Atlas, ICompartmentListContainerProps} from "./atlas/Atlas";
import {fullRowStyle} from "../../../util/styles";
import {UserPreferences} from "../../../util/userPreferences";
import {useAppLayout} from "../../../hooks/useAppLayout";

export enum DrawerState {
    Hidden,
    Float,
    Dock
}

export type MainViewProps = {
    populateCustomPredicate?(position: IPositionInput, replace: boolean): void;
}

type MainViewState = {
    isNeuronListOpen: boolean;
    isNeuronListDocked: boolean;
    isCompartmentListOpen: boolean;
    isCompartmentListDocked: boolean;
    isExportMessageOpen: boolean;
}

export const MainView = observer<React.FC<MainViewProps>>((props) => {
    const appLayout = useAppLayout();

    const [state, setState] = useState<MainViewState>({
        isNeuronListOpen: false,
        isNeuronListDocked: UserPreferences.Instance.IsNeuronListDocked,
        isCompartmentListOpen: false,
        isCompartmentListDocked: UserPreferences.Instance.IsCompartmentListDocked,
        isExportMessageOpen: false
    });

    function onNeuronListCloseOrPin(drawerState: DrawerState) {
        if (drawerState === DrawerState.Hidden) {
            // Close the docked or drawer
            UserPreferences.Instance.IsNeuronListDocked = false;
            setState({...state, isNeuronListDocked: false, isNeuronListOpen: false});
        } else if (drawerState === DrawerState.Float) {
            // Pin the float
            UserPreferences.Instance.IsNeuronListDocked = false;
            setState({...state, isNeuronListDocked: false, isNeuronListOpen: true});
        } else {
            UserPreferences.Instance.IsNeuronListDocked = true;
            setState({...state, isNeuronListDocked: true, isNeuronListOpen: false});
        }
    }

    function onCompartmentListCloseOrPin(drawerState: DrawerState) {
        if (drawerState === DrawerState.Hidden) {
            // Close the docked or drawer
            UserPreferences.Instance.IsCompartmentListDocked = false;
            setState({...state, isCompartmentListDocked: false, isCompartmentListOpen: false});
        } else if (drawerState === DrawerState.Float) {
            // Pin the float
            UserPreferences.Instance.IsCompartmentListDocked = false;
            setState({...state, isCompartmentListDocked: false, isCompartmentListOpen: true});
        } else {
            UserPreferences.Instance.IsCompartmentListDocked = true;
            setState({...state, isCompartmentListDocked: true, isCompartmentListOpen: false});
        }
    }

    const tableProps: INeuronListContainerProps = {
        isDocked: state.isNeuronListDocked,
        onClickCloseOrPin: (s: DrawerState) => onNeuronListCloseOrPin(s)
    };

    const viewerProps: IViewerProps = {
        isNeuronListDocked: state.isNeuronListDocked,
        isCompartmentListDocked: state.isCompartmentListDocked,
        isNeuronListOpen: state.isNeuronListOpen,
        isCompartmentListOpen: state.isCompartmentListOpen,
        populateCustomPredicate: (p: IPositionInput, b: boolean) => props.populateCustomPredicate(p, b),
        onFloatNeuronList: () => onNeuronListCloseOrPin(DrawerState.Float),
        onFloatCompartmentList: () => onCompartmentListCloseOrPin(DrawerState.Float)
    };

    const treeProps: ICompartmentListContainerProps = {
        isDocked: state.isCompartmentListDocked,
        onClickCloseOrPin: (s: DrawerState) => onCompartmentListCloseOrPin(s)
    };

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

    const neuronList = (<NeuronListContainer {...tableProps}/>);

    const neuronListFloat = state.isNeuronListOpen ? (<div style={baseStyle}>  {neuronList}</div>) : null;

    const compartmentListFloat = state.isCompartmentListOpen ? (
        <div style={Object.assign({left: "calc(100% - 400px)"}, baseStyle)}>
            <Atlas {...treeProps}/>
        </div>) : null;

    const compartmentListDock = state.isCompartmentListDocked ? (
        <Atlas {...treeProps}/>) : null;

    const overlay = neuronListFloat !== null || compartmentListFloat !== null ? (
        <div style={{
            width: "100%",
            position: "fixed",
            top: offset + "px",
            zIndex: 1,
            height: "calc(100% - " + offset + "px)",
            backgroundColor: "#000000",
            opacity: 0.1
        }} onClick={() => setState({...state, isNeuronListOpen: false, isCompartmentListOpen: false})}/>) : null;

    const style = {width: "100%", height: "100%"};

    return (
        <div style={style}>
            <Modal open={state.isExportMessageOpen} dimmer="blurring"
                   onClose={() => setState({...state, isExportMessageOpen: false})}>
                <Modal.Header content="Export Failed"/>
                <Modal.Content>
                    <Message error
                             content="There was an issue contacting the download server. The tracings were not downloaded."/>
                </Modal.Content>
                <Modal.Actions>
                    <Button content="Ok" onClick={() => setState({...state, isExportMessageOpen: false})}/>
                </Modal.Actions>
            </Modal>
            {neuronListFloat}
            {compartmentListFloat}
            {overlay}
            <div style={fullRowStyle}>
                {state.isNeuronListDocked ? neuronList : null}
                <ViewerContainer {...viewerProps}/>
                {compartmentListDock}
            </div>
        </div>
    );
});
