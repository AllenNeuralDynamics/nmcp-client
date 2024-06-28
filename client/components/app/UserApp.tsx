import * as React from "react";
import {useQuery} from "@apollo/react-hooks";
import {createContext, useEffect} from "react";
import {useAccount, useIsAuthenticated, useMsal} from "@azure/msal-react";
import {Message} from "semantic-ui-react";

import {USER_QUERY, UserQueryResponse} from "../../graphql/user";
import {IUser} from "../../models/user";

export const UserContext = createContext<IUser>(null);

interface IUserAppProps {
    children: any;
}

export const UserApp = (props: IUserAppProps) => {
    const {instance, accounts} = useMsal();

    const account = useAccount(accounts[0] || {});

    const isAuthenticated = useIsAuthenticated();

    const {loading, error, data, refetch} = useQuery<UserQueryResponse>(USER_QUERY, {
        fetchPolicy: "no-cache"
    });

    useEffect(() => {
            setTimeout(() => {
                (async () => {
                    await refetch()
                })()
            }, 1000)
        }, [isAuthenticated, instance, account]
    )

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
        return (
            <div>
                {props.children}
            </div>)
    }
}
