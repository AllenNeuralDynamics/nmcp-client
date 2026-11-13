import React, {useContext, useEffect} from "react"
import {Navigate, useSearchParams} from "react-router-dom";
import {Indicator, Tabs} from "@mantine/core";
import {IconBook, IconFlagExclamation, IconKey, IconMessages, IconPackage, IconUserPlus, IconUsers} from "@tabler/icons-react";

import {NotificationContext} from "../app/NotificationsApp";
import {Users} from "./users/Users";
import {Collections} from "./system/Collections";
import {Published} from "./published/Published";
import {Issues} from "./issues/Issues";
import {ApiKeys} from "./apiKeys/ApiKeys";
import {AccessRequests, Feedback} from "./accessRequests/AccessRequests";
import {useUser} from "../../hooks/useUser";
import {UserPermissions} from "../../graphql/user";
import {usePageSettings} from "../../hooks/usePageSettings";
import {sectionOf} from "../../util/pageSettings";
import {AdminSettings, AdminTabs} from "./adminSettings";

const iconSize = 24;

export const Admin = () => {
    const user = useUser();

    if ((user?.permissions & UserPermissions.Admin) == 0) {
        return <Navigate to="/" replace/>;
    }

    const [settings, update] = usePageSettings(AdminSettings);

    const notifications = useContext(NotificationContext);

    const [searchParams, setSearchParams] = useSearchParams();

    const requestedTab = searchParams.get("tab");

    const linkedTab = AdminTabs.includes(requestedTab) ? requestedTab : null;

    // A linked tab becomes the stored one and leaves the URL, so later tab changes and reloads behave as if it had been
    // clicked.  It is selected from the first render rather than after the effect, so the stored tab never flashes first.
    useEffect(() => {
        if (linkedTab) {
            update(s => ({...s, tab: linkedTab}));
            setSearchParams(params => {
                params.delete("tab");
                return params;
            }, {replace: true});
        }
    }, [linkedTab]);

    const onChangeTab = (tab: string | null) => {
        if (tab) {
            update(s => ({...s, tab}));
        }
    }

    return (
        <Tabs m={20} value={linkedTab ?? settings.tab} onChange={onChangeTab}>
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
                <Tabs.Tab value="accessrequests" leftSection={<IconUserPlus size={iconSize}/>}
                          rightSection={<Indicator label={notifications.openAccessRequestCount} inline color="yellow" autoContrast
                                                   disabled={notifications.openAccessRequestCount == 0} size={16} ml={-2} mt={-12}/>}>
                    Access Requests
                </Tabs.Tab>
                <Tabs.Tab value="feedback" leftSection={<IconMessages size={iconSize}/>}
                          rightSection={<Indicator label={notifications.openFeedbackCount} inline color="blue" disabled={notifications.openFeedbackCount == 0}
                                                   size={16} ml={-2} mt={-12}/>}>
                    Feedback & Messages
                </Tabs.Tab>
                <Tabs.Tab value="apikeys" leftSection={<IconKey size={iconSize}/>}>
                    API Keys
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="users" mt={16}>
                <Users settings={settings.users} onSettingsChange={sectionOf(update, "users")}/>
            </Tabs.Panel>

            <Tabs.Panel value="collections" mt={16}>
                <Collections settings={settings.collections} onSettingsChange={sectionOf(update, "collections")}/>
            </Tabs.Panel>

            <Tabs.Panel value="published" mt={16}>
                <Published settings={settings.publishing} onSettingsChange={sectionOf(update, "publishing")}/>
            </Tabs.Panel>

            <Tabs.Panel value="issues" mt={16}>
                <Issues settings={settings.issues} onSettingsChange={sectionOf(update, "issues")}/>
            </Tabs.Panel>

            <Tabs.Panel value="accessrequests" mt={16}>
                <AccessRequests settings={settings.accessRequests} onSettingsChange={sectionOf(update, "accessRequests")}/>
            </Tabs.Panel>

            <Tabs.Panel value="feedback" mt={16}>
                <Feedback settings={settings.feedback} onSettingsChange={sectionOf(update, "feedback")}/>
            </Tabs.Panel>

            <Tabs.Panel value="apikeys" mt={16}>
                <ApiKeys/>
            </Tabs.Panel>
        </Tabs>
    );
}
