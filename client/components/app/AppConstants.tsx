import * as React from "react";
import {observer} from "mobx-react-lite";
import {useQuery} from "@apollo/client";
import {createContext} from "react";
import {Message} from "semantic-ui-react";

import {NdbConstants} from "../../models/constants";
import {CONSTANTS_QUERY, ConstantsQueryResponse} from "../../graphql/constants";
import {useStore} from "./App";
import {AppLoading} from "./AppLoading";

export const ConstantsContext = createContext<NdbConstants>(null);

export const AppConstants = observer((props: any) => {
    const systemDataStore = useStore();

    const {
        data,
        error,
        loading
    } = useQuery<ConstantsQueryResponse>(CONSTANTS_QUERY);

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

    console.log("loading NdbConstants");
    NdbConstants.DefaultConstants.load(data!);
    console.log("NdbConstants loaded");

    return (
        <ConstantsContext.Provider value={NdbConstants.DefaultConstants}>
            {props.children}
        </ConstantsContext.Provider>
    );
});
