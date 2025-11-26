import * as React from "react";
import {useQuery} from "@apollo/client";
import {createContext, useEffect} from "react";
import {useAccount, useIsAuthenticated, useMsal} from "@azure/msal-react";

import {USER_QUERY, UserQueryResponse} from "../../graphql/user";
import {User} from "../../models/user";
import {AppLoading} from "./AppLoading";

export const UserContext = createContext<User>(null);

interface IUserAppProps {
    children?: any;
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
        return  <AppLoading message="loading user information"/>
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
