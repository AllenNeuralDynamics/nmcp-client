import React, {useState} from "react"
import {Tab} from "semantic-ui-react"

import {UserPreferences} from "../../util/userPreferences";
import {Users} from "./Users";
import {Collections} from "./Collections";

const panes = [
    {
        menuItem: {key: 'users', icon: 'users', content: 'Users'},
        render: () => <Users/>
    },
    {
        menuItem: {key: 'collections', icon: 'cubes', content: 'Collections'},
        render: () => <Collections/>
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
