import * as React from "react";
import {observer} from "mobx-react-lite";
import {useQuery} from "@apollo/client";
import {createContext} from "react";
import {Message} from "semantic-ui-react";

import {NdbConstants} from "../../models/constants";
import {CONSTANTS_QUERY, ConstantsQueryResponse} from "../../graphql/constants";
import {AppLoading} from "./AppLoading";
import {useAtlas} from "../../hooks/useAtlas";
import {useUIQuery} from "../../hooks/useUIQuery";

export const ConstantsContext = createContext<NdbConstants>(null);

export const AppConstants = observer((props: any) => {
    const {data, error, loading} = useQuery<ConstantsQueryResponse>(CONSTANTS_QUERY);

    const atlas = useAtlas();
    const uiPredicates = useUIQuery();

    if (loading) {
        return <AppLoading message="initializing system data"/>;
    }

    if (error) {
        return (
            <div style={{padding: "20px"}}>
                <Message negative icon="exclamation triangle" header="Service not responding" content="System data could not be loaded."/>
            </div>
        );
    }

    const constants = new NdbConstants();

    constants.load(data!);

    uiPredicates.Constants = constants;
    atlas.initialize(constants);

    return (
        <ConstantsContext.Provider value={constants}>
            {props.children}
        </ConstantsContext.Provider>
    );
});
