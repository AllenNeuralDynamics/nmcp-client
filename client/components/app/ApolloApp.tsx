import * as React from "react";
import {ApolloProvider} from "react-apollo";
import {ApolloProvider as ApolloHooksProvider} from "react-apollo-hooks";
import {ApolloClient} from "apollo-client";
import {InMemoryCache} from "apollo-cache-inmemory";
import {createHttpLink} from "apollo-link-http";

import {AppSystemConfiguration} from "./AppSystemConfiguration";
import {AppConstants} from "./AppConstants";
import {AppContent} from "./AppContent";
import {AppTomography} from "./AppTomography";

const client = new ApolloClient({
    link: createHttpLink({uri: "/graphql"}),
    cache: new InMemoryCache(),
});

export const ApolloApp = () => (
    <ApolloHooksProvider client={client}>
        <ApolloProvider client={client}>
            <AppSystemConfiguration>
                <AppConstants>
                    <AppTomography>
                        <AppContent/>
                    </AppTomography>
                </AppConstants>
            </AppSystemConfiguration>
        </ApolloProvider>
    </ApolloHooksProvider>
);
