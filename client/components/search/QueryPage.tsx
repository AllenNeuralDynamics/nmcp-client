import * as React from "react";
import {useState} from "react";
import {useApolloClient} from "@apollo/client";
import {observer} from "mobx-react";

import {FilterComposition, IPositionInput} from "../../viewmodel/queryFilter";
import {IQueryFilterContainerProps, QueryFilterContainer} from "./query/QueryFilterContainer";
import {MainView, MainViewProps} from "./output/MainView";
import {BRAIN_AREA_FILTER_TYPE_SPHERE} from "../../models/brainAreaFilterType";
import {UserPreferences} from "../../util/userPreferences";
import {NeuroglancerProxy} from "../../viewer/neuroglancer";
import {useQueryResponseViewModel} from "../../hooks/useQueryResponseViewModel";
import {useQueryPredicates} from "../../hooks/useQueryPredicates";
import {useAtlas} from "../../hooks/useAtlas";

export const QueryPage = observer(() => {
    const queryResponse = useQueryResponseViewModel();

    const uiPredicates = useQueryPredicates();

    const client = useApolloClient();

    const atlas = useAtlas();

    const [isQueryCollapsed, setIsQueryCollapsed] = useState<boolean>(false);

    const onPerformQuery = async () => {
        if (isQueryCollapsed && !UserPreferences.Instance.ShouldAutoCollapseOnQuery) {
            setIsQueryCollapsed(!isQueryCollapsed);
        }
        await uiPredicates.execute(queryResponse, client);
    };

    const onResetPage = () => {
        uiPredicates.reset();
        queryResponse.reset();

        atlas.clear();

        setIsQueryCollapsed(false);
    };

    const onShare = async () => {
        const queryData = {
            timestamp: Date.now(),
            filters: uiPredicates.predicates.map(p => p.serialize())
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

    const populateCustomPredicate = (position: IPositionInput, replace: boolean) => {
        setIsQueryCollapsed(false);

        if (replace) {
            const filter = uiPredicates.predicates[uiPredicates.predicates.length - 1];
            filter.brainAreaFilterType = BRAIN_AREA_FILTER_TYPE_SPHERE;
            filter.filter.arbCenter = {
                x: position.x.toFixed(1),
                y: position.y.toFixed(1),
                z: position.z.toFixed(1)
            };
            uiPredicates.replacePredicate(filter);
        } else {
            uiPredicates.addPredicate({
                brainAreaFilterType: BRAIN_AREA_FILTER_TYPE_SPHERE
            }, {
                composition: FilterComposition.and,
                arbCenter: {
                    x: position.x.toFixed(1),
                    y: position.y.toFixed(1),
                    z: position.z.toFixed(1)
                }
            });
        }
    };

    const queryProps: IQueryFilterContainerProps = {
        isCollapsed: isQueryCollapsed,
        onPerformQuery: onPerformQuery,
        onResetPage: onResetPage,
        onShare: onShare,
        onToggleCollapsed: () => setIsQueryCollapsed(!isQueryCollapsed),
    };

    const viewerProps: MainViewProps = {
        isQueryCollapsed: isQueryCollapsed,
        // visibleBrainAreas: atlas.visibleStructures,
        onToggleQueryCollapsed: () => setIsQueryCollapsed(!isQueryCollapsed),
        populateCustomPredicate: (p: IPositionInput, b: boolean) => populateCustomPredicate(p, b)
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
                <MainView{...viewerProps}/>
            </div>
        </div>
    );
});
