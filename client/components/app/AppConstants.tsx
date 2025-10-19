import * as React from "react";
import {createContext} from "react";
import {observer} from "mobx-react-lite";
import {useQuery} from "@apollo/client";

import {DataConstants} from "../../models/constants";
import {AppLoading} from "./AppLoading";
import {useAtlas} from "../../hooks/useAtlas";
import {useUIQuery} from "../../hooks/useUIQuery";
import {CONSTANTS_QUERY, ConstantsQueryResponse} from "../../graphql/constants";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";

export const ConstantsContext = createContext<DataConstants>(null);

export const AppConstants = observer((props: any) => {
    const {data, error, loading} = useQuery<ConstantsQueryResponse>(CONSTANTS_QUERY);

    const atlas = useAtlas();
    const uiPredicates = useUIQuery();

    if (loading) {
        return <AppLoading message="initializing system data"/>;
    }

    if (error) {
        return <GraphQLErrorAlert title="System Data Failed to Load" error={error}/>;
    }

    const constants = new DataConstants();

    constants.load(data!);

    uiPredicates.Constants = constants;
    atlas.initialize(constants.AtlasConstants);

    return (
        <ConstantsContext.Provider value={constants}>
            {props.children}
        </ConstantsContext.Provider>
    );
});
