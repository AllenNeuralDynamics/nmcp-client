import React, {useContext, useState} from "react"
import {Icon, Label, MenuItem, Tab} from "semantic-ui-react"

import {UserPreferences} from "../../util/userPreferences";
import {Users} from "./Users";
import {Collections} from "./Collections";
import {Published} from "./published/Published";
import {Issues} from "./Issues";
import {NotificationContext} from "../app/NotificationsApp";

const panes = [
    {
        menuItem: {key: "users", icon: "users", content: "Users"},
        render: () => <Users/>
    },
    {
        menuItem: {key: "collections", icon: "cubes", content: "Collections"},
        render: () => <Collections/>
    },
    {
        menuItem: {key: "published", icon: "cloud upload", content: "Published"},
        render: () => <Published/>
    },
    {
        menuItem:(
            <MenuItem key='issues'>
                <Icon name="exclamation triangle"/>
                Issues<Label>0</Label>
            </MenuItem>),
        render: () => <Issues/>
    } /*,
    {
        menuItem: {key: "manage", icon: "settings", content: "Manage"},
        render: () => <Manage/>
    }*/
];

export const Admin = () => {
    const [state, setState] = useState<number>(Math.min(panes.length - 1, UserPreferences.Instance.AdminPageSelectedTab));

    const notifications = useContext(NotificationContext);

    panes[3].menuItem = notifications.issueCount > 0 ? (
        <MenuItem key='issues'>
            <Icon name="exclamation triangle"/>
            Issues
            <Label color="red" size="small">{notifications.issueCount}</Label>
        </MenuItem>
    ) : (
        <MenuItem key='issues'>
            <Icon name="exclamation triangle"/>
            Issues
        </MenuItem>
    );

    const onTabChanged = (_, {activeIndex}) => {
        UserPreferences.Instance.AdminPageSelectedTab = activeIndex;
        setState(activeIndex)
    };

    return (
        <div style={{margin: "16px"}}>
            <Tab activeIndex={state} onTabChange={onTabChanged} menu={{pointing: true, color: "blue"}} panes={panes}/>
        </div>
    );
}
