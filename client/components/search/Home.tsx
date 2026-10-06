import * as React from "react";
import {useEffect} from "react";
import {useApolloClient} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Stack} from "@mantine/core";

import {QueryPage} from "./QueryPage";
import {UserPreferences} from "../../util/userPreferences";
import {useQueryResponseViewModel} from "../../hooks/useQueryResponseViewModel";
import {useSearchViewer} from "../../hooks/useSearchViewer";
import {useUIQuery} from "../../hooks/useUIQuery";
import {Footer} from "./Footer";
import {QueryResponseState} from "../../viewmodel/queryResponseViewModel";
import {useAppLayout} from "../../hooks/useAppLayout";
import {warningNotification} from "../common/NotificationHelper";

export const Home = observer(() => {
    const client = useApolloClient();

    const appLayout = useAppLayout();

    const uiQuery = useUIQuery();

    const queryResponseViewModel = useQueryResponseViewModel();

    const searchViewerRef = useSearchViewer();

    useEffect(() => {
        initializeQueryFilters();
    }, []);

    useEffect(() => {
        resetContent();
    }, [uiQuery.resetCount]);

    function parseUrlQuery(): { haveQuery: boolean, responseState: QueryResponseState | null, viewerState: object | null, unresolvedStructures: number } {
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get("q");
        const ngParam = window.location.hash;

        let haveQuery: boolean = false
        let responseState: QueryResponseState | null = null;
        let viewerState: object | null = null;
        let unresolvedStructures = 0;

        if (queryParam) {
            try {
                const decodedQuery = JSON.parse(atob(queryParam));

                if (decodedQuery?.timestamp) {
                    console.log(`shared query from ${new Date(decodedQuery?.timestamp).toLocaleString()}, version ${decodedQuery?.version} decoded.`);
                } else {
                    console.warn(`unexpected query parameter format`);
                }

                if (decodedQuery?.query) {
                    unresolvedStructures = uiQuery.deserialize(decodedQuery.query);
                }

                if (decodedQuery?.response) {
                    responseState = decodedQuery.response;
                }

                if (decodedQuery?.layout) {
                    appLayout.deserialize(decodedQuery.layout);
                }

                haveQuery = true;
            } catch (e) {
                console.warn("Invalid URL query parameter:", e);
            }
        }

        if (ngParam) {
            try {
                viewerState = JSON.parse(atob(ngParam.slice(2)));
            } catch (e) {
                console.warn("Invalid Neuroglancer query parameter:", e);
            }
        }

        window.history.replaceState({}, document.title, "/");

        return {haveQuery, responseState, viewerState, unresolvedStructures};
    }

    function initializeQueryFilters() {
        const {haveQuery, responseState, viewerState, unresolvedStructures} = parseUrlQuery();

        if (haveQuery && unresolvedStructures > 0) {
            // The shared response and viewer states describe results of the original query, which this
            // reconstructed query is not, and earlier results must not stand in for it either.
            queryResponseViewModel.reset();
            warnPartialRestore(unresolvedStructures);
        } else if (haveQuery) {
            setTimeout(async () => {
                await uiQuery.execute(queryResponseViewModel, client, responseState);
                if (viewerState) {
                    searchViewerRef.applyState(viewerState);
                }
            }, 100);
        } else {
            if (viewerState) {
                searchViewerRef.applyState(viewerState);
            }

            const unresolved = uiQuery.deserializePredicates(UserPreferences.Instance.LastQuery);

            if (unresolved > 0) {
                warnPartialRestore(unresolved);
            }
        }
    }

    function warnPartialRestore(count: number) {
        warningNotification("Query Partially Restored", `${count} atlas structure${count === 1 ? "" : "s"} in the saved query could not be identified. The query was reconstructed with the structures that could be, and has not been run.`);
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
