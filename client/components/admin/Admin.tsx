import React, {useContext, useState} from "react"
import {Navigate} from "react-router-dom";
import {Indicator, Tabs} from "@mantine/core";
import {IconBook, IconExclamationCircle, IconFlagExclamation, IconPackage, IconUsers} from "@tabler/icons-react";

import {usePreferences} from "../../hooks/usePreferences";
import {NotificationContext} from "../app/NotificationsApp";
import {Users} from "./users/Users";
import {Collections} from "./system/Collections";
import {Published} from "./published/Published";
import {Issues} from "./issues/Issues";
import {useUser} from "../../hooks/useUser";
import {UserPermissions} from "../../graphql/user";

const allowedTabs = ["users", "collections", "published", "issues"];

const iconSize = 24;

export const Admin = () => {
    const preferences = usePreferences();
    const user = useUser();

    if ((user?.permissions & UserPermissions.Admin) == 0) {
        return <Navigate to="/" replace/>;
    }

    const initial = allowedTabs.indexOf(preferences.AdminPageTab) != -1 ? preferences.AdminPageTab : "users";

    const [activeTab, setActiveTab] = useState<string | null>(initial);

    const notifications = useContext(NotificationContext);

    const onChangeTab = (tab: string) => {
        preferences.AdminPageTab = tab;
        setActiveTab(tab);
    }

    return (
        <Tabs m={20} value={activeTab} onChange={onChangeTab}>
            <Tabs.List>
                <Tabs.Tab value="users" leftSection={<IconUsers size={iconSize}/>}>
                    Users
                </Tabs.Tab>
                <Tabs.Tab value="collections" leftSection={<IconPackage size={iconSize}/>}>
                    Collections
                </Tabs.Tab>
                <Tabs.Tab value="published" leftSection={<IconBook size={iconSize}/>}>
                    Publishing
                </Tabs.Tab>
                <Tabs.Tab value="issues" leftSection={<IconFlagExclamation size={iconSize}/>}
                          rightSection={<Indicator label={notifications.issueCount} inline color="red" disabled={notifications.issueCount == 0} size={16}
                                                   ml={-2} mt={-12}/>}>
                    Issues
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="users" mt={16}>
                <Users/>
            </Tabs.Panel>

            <Tabs.Panel value="collections" mt={16}>
                <Collections/>
            </Tabs.Panel>

            <Tabs.Panel value="published" mt={16}>
                <Published/>
            </Tabs.Panel>

            <Tabs.Panel value="issues" mt={16}>
                <Issues/>
            </Tabs.Panel>
        </Tabs>
    );
}
