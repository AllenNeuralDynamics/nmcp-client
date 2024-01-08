import * as React from "react";
import {ApolloClient} from "@apollo/client";
import {InMemoryCache} from "@apollo/client";
import {ApolloProvider} from "@apollo/client";
import {createHttpLink} from "@apollo/react-hooks";

import {AppSystemConfiguration} from "./AppSystemConfiguration";
import {AppConstants} from "./AppConstants";
import {AppContent} from "./AppContent";
import {AppTomography} from "./AppTomography";

const client = new ApolloClient({
    link: createHttpLink({uri: "/graphql"}),
    cache: new InMemoryCache(),
});

export const ApolloApp = () => (
        <ApolloProvider client={client}>
            <AppSystemConfiguration>
                <AppConstants>
                    <AppTomography>
                        <AppContent/>
                    </AppTomography>
                </AppConstants>
            </AppSystemConfiguration>
        </ApolloProvider>
);
