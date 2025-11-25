import * as React from "react";
import {useContext} from "react";
import {NavLink, useLocation} from "react-router-dom";
import {useIsAuthenticated} from "@azure/msal-react";
import {ActionIcon, Divider, Group, Image, Indicator, Text, useMantineColorScheme} from "@mantine/core";
import {IconMoon, IconSun} from "@tabler/icons-react";

import {SignInSignOutButton} from "./SignInSignOutButton";
import {UserPermissions} from "../../graphql/user";

import logo from "../../../assets/nmcp_logo.png";
import {NotificationContext} from "./NotificationsApp";
import {useUser} from "../../hooks/useUser";
import {useConstants} from "../../hooks/useConstants";

const TextNavLink = ({text, to}: { text: string, to: string }) => {
    return (
        <NavLink to={to} className="header-menu-item">
            {({isActive}: { isActive: boolean }) => (
                <Text p={8} size="md" bdrs={4} bg={isActive ? "#343536" : "transparent"}>{text}</Text>
            )}
        </NavLink>
    );
}
const HomeNavLink = () => {
    return (
        <NavLink to="/">
            {({isActive}: { isActive: boolean }) => (
                <div>
                    <Image mr={16} mb={4} w={214} fit="contain" src={logo}/>
                </div>
            )}
        </NavLink>
    );
}

const IssueNavLink = ({text, to}: { text: string, to: string }) => {
    const notifications = useContext(NotificationContext);

    return (
        <NavLink to={to} className="header-menu-item">
            {({isActive}: { isActive: boolean }) => (
                <Indicator inline color="red" size={16} label="!" disabled={notifications.issueCount == 0}>
                    <Group bdrs={4} bg={isActive ? "#343536" : "transparent"} gap={0}>
                        <Text p={8} size="md">{text}</Text>
                    </Group>
                </Indicator>
            )}
        </NavLink>
    );
}

export const PageHeader = () => {
    const isAuthenticated = useIsAuthenticated();
    const {colorScheme, toggleColorScheme} = useMantineColorScheme();
    const user = useUser();
    const constants = useConstants();

    let totalMessage = "There are no published neurons";

    if (constants.neuronCount > 0) {
        if (constants.neuronCount > 1) {
            totalMessage = `${constants.neuronCount} published neurons`
        } else {
            totalMessage = `1 published neuron`
        }
    }

    const userCanView = user && (user?.permissions & UserPermissions.ViewReconstructions) != 0;

    const userCanEdit = user && (user?.permissions & UserPermissions.Edit) != 0;

    const userCanReview = user && ((user?.permissions & UserPermissions.FullReview) != 0) || ((user?.permissions & UserPermissions.PeerReview) != 0);

    const userCanAdmin = user && (user?.permissions & UserPermissions.Admin) != 0;

    const candidates = isAuthenticated ? "Find Candidate Neurons" : "Explore Candidate Neurons";

    const viewItem = isAuthenticated && userCanView ? <TextNavLink text="Reconstruct Neurons" to="/reconstructions"/> : null;

    const neuronsItem = isAuthenticated && userCanEdit ? <TextNavLink text="Add Specimens" to="/specimens"/> : null;

    const reviewItem = isAuthenticated && userCanReview ? <TextNavLink text="Review Neurons" to="/review"/> : null;

    const adminItem = isAuthenticated && userCanAdmin ? <IssueNavLink text="Admin" to="/admin"/> : null;

    return (
        <Group p={12} justify="space-between" bg="dark.8">
            <Group>
                <HomeNavLink/>
                <TextNavLink text={candidates} to="/candidates"/>
                {viewItem}
                {reviewItem}
                {neuronsItem}
                {adminItem}
            </Group>
            <Group>
                <Text size="sm" c="white">{totalMessage}</Text>
                <Divider orientation="vertical" />
                <ActionIcon variant="subtle" color="white" onClick={() => toggleColorScheme()}>
                    {colorScheme == "light" ? <IconMoon/> : <IconSun/>}
                </ActionIcon>
                <SignInSignOutButton/>
            </Group>
        </Group>
    );
}
