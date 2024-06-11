import * as React from "react";
import {useQuery} from "@apollo/react-hooks";
import {createContext} from "react";
import {Message} from "semantic-ui-react";

import {USER_QUERY, UserQueryResponse} from "../../graphql/user";

export const UserContext = createContext(null);

interface IUserAppProps {
    children: any;
}

export const UserApp = (props: IUserAppProps) => {
    const {loading, error, data} = useQuery<UserQueryResponse>(USER_QUERY);

    if (loading) {
        return (
            <div style={{height: "400px", position: "relative", padding: "40px"}}>
                <Message style={{top: "50%", transform: "translateY(-50%)"}} icon="info circle" header="" content="Loading user information..."/>
            </div>
        );
    }

    if (data && data.user) {
        return (
            <UserContext.Provider value={data.user}>
                {props.children}
            </UserContext.Provider>
        );
    } else {
        return (<div>{props.children}</div>)
    }
}
