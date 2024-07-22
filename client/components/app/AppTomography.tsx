import * as React from "react";
import {observer} from "mobx-react-lite";
import {useQuery} from "@apollo/react-hooks";
import { Message} from "semantic-ui-react";

import {useStore} from "./App";
import {TOMOGRAPHY_QUERY, TomographyApiResponse} from "../../graphql/tomography";
import {AppLoading} from "./AppLoading";

export const AppTomography = observer((props: any) => {
    const Store = useStore();

    const {data, error, loading} = useQuery<TomographyApiResponse>(TOMOGRAPHY_QUERY);

    if (loading) {
        return <AppLoading message="initializing tomography"/>;
    }

    if (error) {
        return (
            <div style={{padding: "20px"}}>
                <Message negative icon="exclamation triangle" header="Service not responding"
                         content="Tomography data could not be loaded."/>
            </div>
        );
    }

    Store.Tomography.fromSource(data.tomographyMetadata);

    return props.children;
});
