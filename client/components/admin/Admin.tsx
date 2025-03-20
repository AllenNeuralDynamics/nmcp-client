import React, {useState} from "react"
import {Tab} from "semantic-ui-react"

import {UserPreferences} from "../../util/userPreferences";
import {Users} from "./Users";
import {Collections} from "./Collections";
import {Manage} from "./Manage";
import {Published} from "./Published";

const panes = [
    {
        menuItem: {key: 'users', icon: 'users', content: 'Users'},
        render: () => <Users/>
    },
    {
        menuItem: {key: 'collections', icon: 'cubes', content: 'Collections'},
        render: () => <Collections/>
    },
    {
        menuItem: {key: 'published', icon: 'cloud upload', content: 'Published'},
        render: () => <Published/>
    },
    {
        menuItem: {key: 'manage', icon: 'settings', content: 'Manage'},
        render: () => <Manage/>
    }
];

export const Admin = () => {
    const [state, setState] = useState<number>(UserPreferences.Instance.AdminPageSelectedTab);

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
