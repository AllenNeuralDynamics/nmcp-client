import * as React from "react";
import {useContext, useState} from "react";
import {NavLink} from "react-router-dom";
import {Dropdown, Icon, Image, Label, Menu, MenuItem, Modal} from "semantic-ui-react";
import {useIsAuthenticated} from "@azure/msal-react";
import {observer} from "mobx-react-lite";

import {PreferencesManager} from "../../util/preferencesManager";
import {useViewModel} from "../app/App";
import {SignInSignOutButton} from "../app/SignInSignOutButton";
import {UserPermissions} from "../../graphql/user";

import logo from "../../../assets/nmcp_logo.png";
import {UserContext} from "../app/UserApp";
import {NotificationContext} from "../app/NotificationsApp";

type PageHeaderState = {
    showShortcuts?: boolean;
}

export const PageHeader = () => {
    const [state, setState] = useState<PageHeaderState>({showShortcuts: false});
    const isAuthenticated = useIsAuthenticated();

    const user = useContext(UserContext);

    const notifications = useContext(NotificationContext);

    const userCanView = user && (user.permissions & UserPermissions.ViewReconstructions) != 0

    const userCanEdit = user && (user.permissions & UserPermissions.Edit) != 0

    const userCanReview = user && (user.permissions & UserPermissions.FullReview) != 0

    const userCanAdmin = user && (user.permissions & UserPermissions.Admin) != 0

    const helpItems = [
        <Dropdown.Item key={"2"} onClick={() => setState({showShortcuts: true})}>
            Shortcuts
        </Dropdown.Item>
    ];

    const issueCountLabel = (
        <Label color="red" key="red" size="small" style={{marginLeft: "4px", marginTop: "2px"}}>{notifications.issueCount}</Label>
    );

    return (
        <Menu inverted fluid stackable borderless={true} style={{marginBottom: "0px"}}>
            <Modal open={state.showShortcuts} onClose={() => setState({showShortcuts: false})}>
                <Modal.Header content="Viewer Shortcuts"/>
                <Modal.Content>
                    <ul>
                        <li>ctrl-click: snap to position</li>
                        <li>shift-click: add neuron to selection</li>
                        <li>alt/option-click: toggle neuron on/off</li>
                    </ul>
                </Modal.Content>
            </Modal>

            <Menu.Item fitted="horizontally" as="a" style={{padding: "0px 16px", maxWidth: "214px"}} href="/">
                <Image size="small" src={logo}/>
            </Menu.Item>

            {isAuthenticated ? <Menu.Item as={NavLink} exact to="/candidates" name="candidates" key="candidates">Find Candidate Neurons</Menu.Item> : null}
            {isAuthenticated && userCanView ?
                <Menu.Item as={NavLink} exact to="/reconstructions" name="reconstructions" key="reconstructions">Reconstruct Neurons</Menu.Item> : null}
            {isAuthenticated && userCanReview ? <Menu.Item as={NavLink} exact to="/review" name="review" key="review">Review Reconstructions</Menu.Item> : null}
            {isAuthenticated && userCanEdit ? <Menu.Item as={NavLink} exact to="/samples" name="samples" key="samples">Add Samples</Menu.Item> : null}
            {isAuthenticated && userCanAdmin ? <Menu.Item as={NavLink} exact to="/admin" name="admin" key="admin">Admin{issueCountLabel}</Menu.Item> : null}
            <Menu.Menu position="right">
                <Dropdown item text="Help">
                    <Dropdown.Menu>
                        {helpItems}
                    </Dropdown.Menu>
                </Dropdown>

                {PreferencesManager.HavePreferences ? <PreferencesMenuItem/> : null}

                <MenuItem>
                    <SignInSignOutButton/>
                </MenuItem>
            </Menu.Menu>
        </Menu>
    );
}

const PreferencesMenuItem = observer(() => {
    const viewModel = useViewModel();

    return <MenuItem onClick={() => viewModel.Settings.openSettingsDialog()}>
        <Icon name="cog"/>
    </MenuItem>;
});
