import * as React from "react";
import {useContext, useState} from "react";
import {observer} from "mobx-react-lite";
import {Badge, Checkbox, Divider, Group, Modal, Stack, Text} from "@mantine/core";

import {UserPreferences} from "../../util/userPreferences";
import {ConstantsContext} from "./AppConstants";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";
import {useAppLayout} from "../../hooks/useAppLayout";

export const SettingsDialogContainer = observer(() => {
    const appLayout = useAppLayout();

    return <Preferences show={appLayout.isPreferencesWindowOpen} onHide={() => appLayout.closeSettingsDialog()}/>;
});

type SettingsDialogProps = {
    show: boolean

    onHide(): void;
}

type SettingsDialogState = {
    shouldAutoCollapseOnQuery?: boolean;
}

const Preferences = (props: SettingsDialogProps) => {
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
        <Modal.Root opened={props.show} onClose={props.onHide} size="lg" centered>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>Preferences</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack m={0} p={12}>
                            <Checkbox data-autofocus label="Collapse query after search" checked={state.shouldAutoCollapseOnQuery}
                                      onChange={(evt) => onSetAutoCollapseOnQuery(evt.currentTarget.checked)}/>
                    </Stack>
                    <Divider orientation="horizontal"/>
                    <Group p={12} justify="space-between">
                        <Text c="dimmed" size="sm">Neuron Morphology Community Portal</Text>
                        <Group>
                            <Badge variant="light" color="blue">Client v{systemConfiguration.systemVersion}</Badge>
                            <Badge variant="light" color="teal">API v{Constants.ApiVersion}</Badge>
                        </Group>
                    </Group>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
}
