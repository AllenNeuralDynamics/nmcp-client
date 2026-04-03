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

    function parseUrlQuery(): { responseState: QueryResponseState | null, viewerState: object | null } {
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get("q");
        const ngParam = window.location.hash;

        let responseState: QueryResponseState | null = null;
        let viewerState: object | null = null;

        if (queryParam) {
            try {
                const decodedQuery = JSON.parse(atob(queryParam));

                if (decodedQuery?.timestamp) {
                    console.log(`shared query from ${new Date(decodedQuery?.timestamp).toLocaleString()}, version ${decodedQuery?.version} decoded.`);
                } else {
                    console.warn(`unexpected query parameter format`);
                }

                if (decodedQuery?.query) {
                    uiQuery.deserialize(decodedQuery.query);
                }

                if (decodedQuery?.response) {
                    responseState = decodedQuery.response;
                }

                if (decodedQuery?.layout) {
                    appLayout.deserialize(decodedQuery.layout);
                }
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

        return {responseState, viewerState};
    }

    function initializeQueryFilters() {
        const {responseState, viewerState} = parseUrlQuery();

        if (uiQuery.predicates.length > 0) {
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
            uiQuery.deserializePredicates(UserPreferences.Instance.LastQuery);
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
