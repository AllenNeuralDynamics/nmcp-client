import * as React from "react";
import {useEffect} from "react";
import {observer} from "mobx-react-lite";
import {useApolloClient} from "@apollo/client";
import {Stack} from "@mantine/core";

import {QueryPage} from "./QueryPage";
import {UserPreferences} from "../../util/userPreferences";
import {useConstants} from "../../hooks/useConstants";
import {useUIQuery} from "../../hooks/useUIQuery";
import {useQueryResponseViewModel} from "../../hooks/useQueryResponseViewModel";
import {Footer} from "./Footer";
import {UIQueryPredicate} from "../../viewmodel/uiQueryPredicate";

export const Home = observer(() => {
    const client = useApolloClient();

    const constants = useConstants();

    const uiPredicates = useUIQuery();

    const queryResponseViewModel = useQueryResponseViewModel();

    useEffect(() => {
        initializeQueryFilters();
    }, []);

    useEffect(() => {
        resetContent();
    }, [uiPredicates.resetCount]);

    function parseUrlQuery(): UIQueryPredicate[] | null {
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get("q");
        const ngParam = window.location.hash;

        let predicates: UIQueryPredicate[] = [];

        if (ngParam) {
            try {
                const decodedState = JSON.parse(atob(ngParam.slice(2)));
                // NeuroglancerProxy.applyQueryParameterState(decodedState);
            } catch (e) {
                console.warn("Invalid Neuroglancer query parameter:", e);
            }
        }

        if (queryParam) {
            try {
                const decodedQuery = JSON.parse(atob(queryParam));
                if (decodedQuery && decodedQuery.filters && Array.isArray(decodedQuery.filters)) {
                    predicates = decodedQuery.filters.map(f => UIQueryPredicate.deserialize(f, constants));
                }
            } catch (e) {
                console.warn("Invalid URL query parameter:", e);
            }
        }

        window.history.replaceState({}, document.title, "/");

        return predicates;
    }

    function updateUrlWithQuery(predicates: UIQueryPredicate[]) {
        // TODO Make the URL copyable w/contents of Share button
        const queryData = {
            timestamp: Date.now(),
            filters: predicates.map(p => p.serialize())
        };

        const encodedQuery = btoa(JSON.stringify(queryData));
        const url = new URL(window.location.href);
        url.searchParams.set("q", encodedQuery);

        window.history.replaceState({}, "", url.toString());
    }

    function initializeQueryFilters() {
        const urlQuery = parseUrlQuery();

        if (urlQuery && urlQuery.length > 0) {
            uiPredicates.predicates = urlQuery;
            setTimeout(async () => {
                await uiPredicates.execute(queryResponseViewModel, client);
            }, 100);
        } else {
            uiPredicates.deserializePredicates(UserPreferences.Instance.LastQuery);
        }
    }

    function resetContent() {
        const url = new URL(window.location.href);
        url.searchParams.delete("q");
        window.history.replaceState({}, "", url.toString());
    }

    return (
        <Stack justify="stretch" gap={0} style={{flexGrow: 1}}>
            <QueryPage/>
            <Footer/>
        </Stack>
    );
});
