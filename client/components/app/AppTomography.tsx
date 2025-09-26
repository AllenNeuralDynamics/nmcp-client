import * as React from "react";
import {observer} from "mobx-react-lite";
import {useQuery} from "@apollo/client";
import { Message} from "semantic-ui-react";

import {TOMOGRAPHY_QUERY, TomographyApiResponse} from "../../graphql/tomography";
import {AppLoading} from "./AppLoading";
import {useTomography} from "../../hooks/useTomography";

export const AppTomography = observer((props: any) => {
    const Tomography = useTomography();

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

    Tomography.fromSource(data.tomographyMetadata);

    return props.children;
});
