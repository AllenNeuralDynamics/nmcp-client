import * as React from "react";
import {observer} from "mobx-react-lite";
import {useQuery} from "@apollo/react-hooks";
import {createContext} from "react";
import {Message} from "semantic-ui-react";

import {NdbConstants} from "../../models/constants";
import {CONSTANTS_QUERY, ConstantsQueryResponse, SystemSettingsVariables} from "../../graphql/constants";
import {useStore} from "./App";
import {AppLoading} from "./AppLoading";

export const ConstantsContext = createContext<NdbConstants>(null);

export const AppConstants = observer((props: any) => {
    const systemDataStore = useStore();

    const {
        data,
        error,
        loading
    } = useQuery<ConstantsQueryResponse, SystemSettingsVariables>(CONSTANTS_QUERY, {variables: {searchScope: systemDataStore.SystemConfiguration.searchScope}});

    if (loading) {
        return <AppLoading message="initializing system data"/>;
    }

    if (error) {
        return (
            <div style={{padding: "20px"}}>
                <Message negative icon="exclamation triangle" header="Service not responding"
                         content="System data could not be loaded."/>
            </div>
        );
    }

    NdbConstants.DefaultConstants.load(data!);

    return (
        <ConstantsContext.Provider value={NdbConstants.DefaultConstants}>
            {props.children}
        </ConstantsContext.Provider>
    );
});
