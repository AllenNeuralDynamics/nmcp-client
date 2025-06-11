import * as React from "react";
import {useEffect} from "react";
import {InteractionRequiredAuthError} from "@azure/msal-browser";
import {useAccount, useIsAuthenticated, useMsal} from "@azure/msal-react";
import {ApolloClient, InMemoryCache, ApolloLink, ApolloProvider, concat} from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import {ToastContainer, ToastPosition} from "react-toastify";

import {AppConstants} from "./AppConstants";
import {loginRequest} from "../../authConfig";
import {UserApp} from "./UserApp";
import {AppRouter} from "./AppRouter";
import {PageHeader} from "../page/PageHeader";
import {SettingsDialogContainer} from "../page/SettingsDialog";
import {AppSystemConfiguration} from "./AppSystemConfiguration";
import {NotificationsApp} from "./NotificationsApp";

const toastStyleOverride = {
    minWidth: "600px",
    marginBottom: "40px"
};

export const ApolloApp = () => {
    const {instance, accounts} = useMsal();

    const isAuthenticated = useIsAuthenticated();

    const account = useAccount(accounts[0] || {});

    const uploadLink = createUploadLink({uri: "/graphql"});

    const authMiddleware = new ApolloLink((operation, forward) => {
        // add the authorization to the headers
        operation.setContext({
            headers: {
                authorization: localStorage.getItem("token") || null,
            }
        });

        return forward(operation);
    })

    const client: ApolloClient<any> = new ApolloClient({
        link: concat(authMiddleware, uploadLink),
        cache: new InMemoryCache(),
    });

    useEffect(() => {
        if (!isAuthenticated) {
            (async () => {
                await client.resetStore() //clear Apollo cache when user logg=s off
            })()
        } else if (account) {
            instance.acquireTokenSilent({
                scopes: loginRequest.scopes,
                account: instance.getAllAccounts()[0]
            }).then(tokenResponse => {
                localStorage.setItem("token", tokenResponse.accessToken);
            }).catch(error => {
                if (error instanceof InteractionRequiredAuthError) {
                    // fallback to interaction when silent call fails
                    return instance.acquireTokenRedirect({scopes: loginRequest.scopes})
                }
                // handle other errors
            });
        }
    }, [isAuthenticated, instance, account])

    return <ApolloProvider client={client}>
        <UserApp>
            <AppSystemConfiguration>
                <AppConstants>
                    <NotificationsApp>
                        <PageHeader/>
                        <SettingsDialogContainer/>
                        <ToastContainer autoClose={6000} position={ToastPosition.BOTTOM_CENTER} style={toastStyleOverride}/>
                        <AppRouter/>
                    </NotificationsApp>
                </AppConstants>
            </AppSystemConfiguration>
        </UserApp>
    </ApolloProvider>
};
