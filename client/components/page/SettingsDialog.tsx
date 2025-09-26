import * as React from "react";
import {useContext, useState} from "react";
import {observer} from "mobx-react-lite";
import {Button, Form, Header, Label, Modal} from "semantic-ui-react";

import {useViewModel} from "../../hooks/useViewModel";
import {UserPreferences} from "../../util/userPreferences";
import {ConstantsContext} from "../app/AppConstants";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";

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
}

const SettingsDialog = (props: SettingsDialogProps) => {
    const [state, setState] = useState<SettingsDialogState>({
        shouldAutoCollapseOnQuery: UserPreferences.Instance.ShouldAutoCollapseOnQuery,
        shouldAlwaysShowSoma: UserPreferences.Instance.ShouldAlwaysShowSoma,
        shouldAlwaysShowFullTracing: UserPreferences.Instance.ShouldAlwaysShowFullTracing,
        displayColorPicker: false
    });
    const Constants = useContext(ConstantsContext);

    const systemConfiguration = useSystemConfiguration();

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
                    <Label color="blue">Client v{systemConfiguration.systemVersion}</Label>
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
