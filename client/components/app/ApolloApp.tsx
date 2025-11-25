import * as React from "react";
import {useEffect} from "react";
import {InteractionRequiredAuthError} from "@azure/msal-browser";
import {useAccount, useIsAuthenticated, useMsal} from "@azure/msal-react";
import {ApolloClient, InMemoryCache, ApolloProvider, concat} from "@apollo/client";
import {setContext} from "@apollo/client/link/context";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

import {AppConstants} from "./AppConstants";
import {loginRequest} from "../../authConfig";
import {UserApp} from "./UserApp";
import {AppRouter} from "./AppRouter";
import {PageHeader} from "./PageHeader";
import {SettingsDialogContainer} from "./Preferences";
import {AppSystemConfiguration} from "./AppSystemConfiguration";
import {NotificationsApp} from "./NotificationsApp";
import {PolledData} from "./PolledData";
import {AppLoading} from "./AppLoading";
import {Stack} from "@mantine/core";

export const ApolloApp = () => {
    const {instance, accounts, inProgress} = useMsal();

    const isAuthenticated = useIsAuthenticated();

    const account = useAccount(accounts[0] || {});

    const uploadLink = createUploadLink({uri: "/graphql"});

    const acquireSilent = async () => {
        if (instance.getAllAccounts().length > 0) {
            try {
                return await instance.acquireTokenSilent({scopes: loginRequest.scopes, account: instance.getAllAccounts()[0]})
            } catch (error) {
                await instance.acquireTokenRedirect({scopes: loginRequest.scopes});
                return null;
            }
        }
        return null;
    }

    const authLink = setContext(async (_, {headers}) => {
        // add the authorization to the headers
        const tokenResponse = await acquireSilent();

        return {
            headers: {
                ...headers,
                authorization: tokenResponse?.accessToken ?? null,
            }
        };
    })

    const client: ApolloClient<any> = new ApolloClient({
        link: concat(authLink, uploadLink),
        cache: new InMemoryCache()
    });

    useEffect(() => {
        if (inProgress == "none") {
            if (!isAuthenticated) {
                (async () => {
                    await client.clearStore() //clear Apollo cache when user logs off
                })()
            } else if (account) {
                instance.acquireTokenSilent({
                    scopes: loginRequest.scopes,
                    account: instance.getAllAccounts()[0]
                }).then(tokenResponse => {
                    // localStorage.setItem("token", tokenResponse.accessToken);
                }).catch(error => {
                    console.log(error)
                    if (error instanceof InteractionRequiredAuthError) {
                        // fallback to interaction when silent call fails
                        return instance.acquireTokenRedirect({scopes: loginRequest.scopes})
                    }
                    // handle other errors
                });
            }
        }
    }, [isAuthenticated, instance, account, inProgress]);

    if (inProgress != "none") {
        return <AppLoading message="authenticating"/>
    }

    return <ApolloProvider client={client}>
        <UserApp>
            <AppSystemConfiguration>
                <AppConstants>
                    <PolledData/>
                    <SettingsDialogContainer/>
                    <NotificationsApp>
                        <Stack justify="stretch" gap={0} h="100%">
                            <PageHeader/>
                            <AppRouter/>
                        </Stack>
                    </NotificationsApp>
                </AppConstants>
            </AppSystemConfiguration>
        </UserApp>
    </ApolloProvider>
};
