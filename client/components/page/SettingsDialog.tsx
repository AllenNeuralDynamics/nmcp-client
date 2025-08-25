import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {Button, Form, Header, Label, Modal} from "semantic-ui-react";
import {SketchPicker} from 'react-color';

import {useStore, useViewModel} from "../app/App";
import {UserPreferences} from "../../util/userPreferences";
import {ViewerStyle} from "../../viewer/viewerStyle";

export const SettingsDialogContainer = observer(() => {
    const viewModel = useViewModel();

    return <SettingsDialog show={viewModel.Settings.IsSettingsWindowOpen} onHide={() => viewModel.Settings.closeSettingsDialog()}/>;
});

type SettingsDialogProps = {
    show: boolean

    onHide(): void;
}

type SettingsDialogState = {
    shouldAutoCollapseOnQuery?: boolean;
    shouldAlwaysShowSoma?: boolean;
    shouldAlwaysShowFullTracing?: boolean;
    displayColorPicker?: boolean;
    useNeuroglancer?: boolean;
}

const SettingsDialog = (props: SettingsDialogProps) => {
    const [state, setState] = useState<SettingsDialogState>({
        shouldAutoCollapseOnQuery: UserPreferences.Instance.ShouldAutoCollapseOnQuery,
        shouldAlwaysShowSoma: UserPreferences.Instance.ShouldAlwaysShowSoma,
        shouldAlwaysShowFullTracing: UserPreferences.Instance.ShouldAlwaysShowFullTracing,
        useNeuroglancer: UserPreferences.Instance.ViewerStyle == ViewerStyle.Neuroglancer,
        displayColorPicker: false
    });

    const {SystemConfiguration, Constants} = useStore();

    const onSetAutoCollapseOnQuery = (b: boolean) => {
        UserPreferences.Instance.ShouldAutoCollapseOnQuery = b;
        setState({shouldAutoCollapseOnQuery: b});
    }

    const onSetAlwaysShowSoma = (b: boolean) => {
        UserPreferences.Instance.ShouldAlwaysShowSoma = b;
        setState({shouldAlwaysShowSoma: b});
    }

    const onSetAlwaysShowFullTracing = (b: boolean) => {
        UserPreferences.Instance.ShouldAlwaysShowFullTracing = b;
        setState({shouldAlwaysShowFullTracing: b});
    }

    const handleClick = () => {
        setState({displayColorPicker: !state.displayColorPicker})
    }

    const handleClose = () => {
        setState({displayColorPicker: false})
    }

    const onChangeNeuronColor = (color: any) => {
        UserPreferences.Instance.ViewerBackgroundColor = color.hex;
    }

    const onUseNeuroglancer = (b: boolean) => {
        UserPreferences.Instance.ViewerStyle = b ? ViewerStyle.Neuroglancer : ViewerStyle.Default;
        setState({useNeuroglancer: b});
    }

    const rowStyles = {
        color: {
            width: "16px",
            height: "16px",
            borderRadius: "2px",
            background: UserPreferences.Instance.ViewerBackgroundColor,
        }
    };

    return (
        <Modal open={props.show} onClose={props.onHide} dimmer="blurring">
            <Modal.Header style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <Header style={{margin: "0"}}>Settings</Header>
                <div>
                    <Label color="blue">Client v{SystemConfiguration.systemVersion}</Label>
                    <br/>
                    <Label color="teal">API v{Constants.ApiVersion}</Label>
                </div>
            </Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Checkbox width={16} checked={state.shouldAutoCollapseOnQuery}
                                   label="Collapse query after search"
                                   onChange={(_, props) => onSetAutoCollapseOnQuery(props.checked)}/>
                    <Form.Checkbox width={16} checked={state.shouldAlwaysShowSoma}
                                   style={{marginTop: "10px"}}
                                   label="Always display tracing after search"
                                   onChange={(_, props) => onSetAlwaysShowSoma(props.checked)}/>
                    <Form.Checkbox width={16} checked={state.shouldAlwaysShowFullTracing}
                                   style={{marginLeft: "26px"}}
                                   disabled={!state.shouldAlwaysShowSoma}
                                   label="Display full tracing in addition to soma"
                                   onChange={(_, props) => onSetAlwaysShowFullTracing(props.checked)}/>
                    {/**
                    {Constants.EnabledUpdatedViewer ?
                        <Form.Checkbox width={16} checked={state.useNeuroglancer}
                                       label="Use Neuroglancer as viewer (browser refresh recommended)"
                                       onChange={(_, props) => onUseNeuroglancer(props.checked)}/> : null}
                    <div style={{display: "flex", flexDirection: "row", alignItems: "center", marginTop: "20px"}}>
                        <div style={styles.swatch} onClick={() => handleClick()}>
                            <div style={rowStyles.color}/>
                        </div>
                        {state.displayColorPicker ? <div style={styles.popover}>
                            <div style={styles.cover} onClick={() => handleClose()}/>
                            <SketchPicker color={UserPreferences.Instance.ViewerBackgroundColor}
                                          onChange={(color: any) => onChangeNeuronColor(color)}/>
                        </div> : null}
                        <span style={styles.text}> Viewer background color</span>
                    </div>
                     **/}
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Actions>
        </Modal>
    );
}

type position = "initial" | "inherit" | "unset" | "relative" | "absolute" | "fixed" | "static" | "sticky";
type zIndex = number | "initial" | "inherit" | "unset" | "auto";

const styles = {
    swatch: {
        padding: "4px",
        background: "#efefef",
        borderRadius: "2px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        order: 1,
        flex: "0 0 auto",
        cursor: "pointer",
    },
    popover: {
        position: "absolute" as position,
        zIndex: "1000" as zIndex,
    },
    cover: {
        position: "fixed" as position,
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "-200px",
    },
    text: {
        paddingLeft: "10px",
        order: 2,
        flex: "0 0 auto",
    }
};
