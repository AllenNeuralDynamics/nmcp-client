import * as React from "react";
import {useContext, useState} from "react";
import {observer} from "mobx-react-lite";
import {Button, Form, Header, Label, Modal} from "semantic-ui-react";

import {UserPreferences} from "../../util/userPreferences";
import {ConstantsContext} from "../app/AppConstants";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";
import {usePreferences} from "../../hooks/usePreferences";

export const SettingsDialogContainer = observer(() => {
    const preferences = usePreferences();

    return <SettingsDialog show={preferences.isPreferencesWindowOpen} onHide={() => preferences.closeSettingsDialog()}/>;
});

type SettingsDialogProps = {
    show: boolean

    onHide(): void;
}

type SettingsDialogState = {
    shouldAutoCollapseOnQuery?: boolean;
}

const SettingsDialog = (props: SettingsDialogProps) => {
    const [state, setState] = useState<SettingsDialogState>({
        shouldAutoCollapseOnQuery: UserPreferences.Instance.ShouldAutoCollapseOnQuery,
    });
    const Constants = useContext(ConstantsContext);

    const systemConfiguration = useSystemConfiguration();

    const onSetAutoCollapseOnQuery = (b: boolean) => {
        UserPreferences.Instance.ShouldAutoCollapseOnQuery = b;
        setState({shouldAutoCollapseOnQuery: b});
    }

    return (
        <Modal open={props.show} onClose={props.onHide} dimmer="blurring">
            <Modal.Header style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <Header style={{margin: "0"}}>Preferences</Header>
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
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Actions>
        </Modal>
    );
}
