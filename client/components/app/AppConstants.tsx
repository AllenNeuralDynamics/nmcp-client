import * as React from "react";
import {createContext, useMemo} from "react";
import {useQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";

import {DataConstants} from "../../models/constants";
import {AppLoading} from "./AppLoading";
import {useSearchAtlas} from "../../hooks/useSearchAtlas";
import {useUIQuery} from "../../hooks/useUIQuery";
import {CONSTANTS_QUERY, ConstantsQueryResponse} from "../../graphql/constants";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";

export const ConstantsContext = createContext<DataConstants>(null);

export const AppConstants = observer((props: any) => {
    const {data, error, loading} = useQuery<ConstantsQueryResponse>(CONSTANTS_QUERY);

    const searchAtlas = useSearchAtlas();
    const uiQuery = useUIQuery();

    const constants = useMemo(() => {
        if (!data) {
            return null;
        }

        const loaded = new DataConstants();

        loaded.load(data);

        return loaded;
    }, [data]);

    if (loading) {
        return <AppLoading message="initializing system data"/>;
    }

    if (error) {
        return <GraphQLErrorAlert title="System Data Failed to Load" error={error}/>;
    }

    uiQuery.initialize(constants);

    if (!searchAtlas.atlas) {
        searchAtlas.select(constants.DefaultAtlas);
    }

    return (
        <ConstantsContext.Provider value={constants}>
            {props.children}
        </ConstantsContext.Provider>
    );
});
