import * as React from "react";
import {useApolloClient} from "@apollo/client";
import {observer} from "mobx-react";

import {useAppLayout} from "../../hooks/useAppLayout";
import {useUIQuery} from "../../hooks/useUIQuery";
import {useAtlas} from "../../hooks/useAtlas";
import {useQueryResponseViewModel} from "../../hooks/useQueryResponseViewModel";
import {IPositionInput} from "../../viewmodel/filterContents";
import {IQueryFilterContainerProps, QueryFilterContainer} from "./query/QueryFilterContainer";
import {MainView} from "./output/MainView";
import {UserPreferences} from "../../util/userPreferences";
import {NeuroglancerProxy} from "../../viewer/neuroglancerProxy";

export const QueryPage = observer(() => {
    const appLayout = useAppLayout();

    const queryResponse = useQueryResponseViewModel();

    const uiQuery = useUIQuery();

    const client = useApolloClient();

    const atlas = useAtlas();

    const onPerformQuery = async () => {
        if (!appLayout.isQueryExpanded && !UserPreferences.Instance.ShouldAutoCollapseOnQuery) {
            appLayout.isQueryExpanded = true;
        }
        await uiQuery.execute(queryResponse, client);
    };

    const onResetPage = () => {
        uiQuery.reset();
        queryResponse.reset();

        atlas.clear();

        appLayout.isQueryExpanded = true;
    };

    const onShare = async () => {
        const queryData = {
            timestamp: Date.now(),
            filters: uiQuery.predicates.map(p => p.serialize())
        };

        const encodedQuery = btoa(JSON.stringify(queryData));
        const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        let shareUrl = `${baseUrl}?q=${encodedQuery}`;

        const ngState = NeuroglancerProxy.SearchNeuroglancer?.State;

        if (ngState) {
            shareUrl += `#!${btoa(JSON.stringify(ngState))}`;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(shareUrl);
            } catch (err) {
                console.error("Failed to copy URL to clipboard:", err);
            }
        } else {
            console.warn("Clipboard not supported in this browser.");
        }
    };

    const queryProps: IQueryFilterContainerProps = {
        onPerformQuery: onPerformQuery,
        onResetPage: onResetPage,
        onShare: onShare
    };

    return (
        <div style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
            alignItems: "flex-start",
            alignContent: "flex-start"
        }}>
            <div style={{width: "100%", order: 1, flexBasis: "auto", overflow: "auto"}}>
                <QueryFilterContainer {...queryProps}/>
            </div>
            <div style={{height: "100px", width: "100%", flexGrow: 1, flexShrink: 1, order: 2}}>
                <MainView/>
            </div>
        </div>
    );
});
