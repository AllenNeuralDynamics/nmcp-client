import * as React from "react";
import {createContext} from "react";
import {useQuery} from "@apollo/client";

import {USER_QUERY, UserQueryResponse} from "../../graphql/user";
import {User} from "../../models/user";
import {AppLoading} from "./AppLoading";

export const UserContext = createContext<User>(null);

interface IUserAppProps {
    children?: any;
}

// The provider is rendered with or without a user so that no result can change the element type above the page and
// remount it.  A sign-in or sign-out needs no refetch here: ApolloApp replaces this tree while MSAL is interacting, and
// a change of account from another tab gives it a new client, which reruns the query.
export const UserApp = (props: IUserAppProps) => {
    const {loading, data} = useQuery<UserQueryResponse>(USER_QUERY, {
        fetchPolicy: "no-cache"
    });

    if (loading) {
        return <AppLoading message="loading user information"/>
    }

    return (
        <UserContext.Provider value={data?.user ?? null}>
            {props.children}
        </UserContext.Provider>
    );
}
