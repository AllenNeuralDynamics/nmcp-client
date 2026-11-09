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
import {consumeShareFragment, startShareLinkSync} from "../../util/shareLinkSync";

export const Home = observer(() => {
    const client = useApolloClient();

    const appLayout = useAppLayout();

    const uiQuery = useUIQuery();

    const queryResponseViewModel = useQueryResponseViewModel();

    const searchViewerRef = useSearchViewer();

    // The URL is written only once the restore has finished, so it never records a half-restored page over the link
    // that is being restored.
    useEffect(() => {
        let stopSync: (() => void) | null = null;
        let unmounted = false;

        initializeQueryFilters().finally(() => {
            if (!unmounted) {
                stopSync = startShareLinkSync({uiQuery, queryResponse: queryResponseViewModel, appLayout, searchViewerRef});
            }
        });

        return () => {
            unmounted = true;
            stopSync?.();
        };
    }, []);

    function parseShareLink(): { haveQuery: boolean, responseState: QueryResponseState | null, viewerState: object | null, unresolvedStructures: number } {
        let haveQuery: boolean = false
        let responseState: QueryResponseState | null = null;
        let viewerState: object | null = null;
        let unresolvedStructures = 0;

        try {
            const share = consumeShareFragment();

            if (share) {
                if (share.timestamp) {
                    console.log(`shared query from ${new Date(share.timestamp).toLocaleString()}, version ${share.version} decoded.`);
                } else {
                    console.warn(`unexpected share link format`);
                }

                if (share.query) {
                    unresolvedStructures = uiQuery.deserialize(share.query);
                }

                if (share.response) {
                    responseState = share.response;
                }

                if (share.layout) {
                    appLayout.deserialize(share.layout);
                }

                viewerState = share.viewer ?? null;

                haveQuery = true;
            }
        } catch (e) {
            console.warn("Invalid share link:", e);
        }

        return {haveQuery, responseState, viewerState, unresolvedStructures};
    }

    async function initializeQueryFilters() {
        const {haveQuery, responseState, viewerState, unresolvedStructures} = parseShareLink();

        if (haveQuery && unresolvedStructures > 0) {
            // The shared response and viewer states describe results of the original query, which this
            // reconstructed query is not, and earlier results must not stand in for it either.
            queryResponseViewModel.reset();
            warnPartialRestore(unresolvedStructures);
        } else if (haveQuery && responseState) {
            await new Promise(resolve => setTimeout(resolve, 100));

            await uiQuery.execute(queryResponseViewModel, client, responseState);

            if (viewerState) {
                searchViewerRef.applyState(viewerState);
            }
        } else if (haveQuery) {
            // The page the link came from had not run its query, so neither does this one.
            if (viewerState) {
                searchViewerRef.applyState(viewerState);
            }
        } else {
            const unresolved = uiQuery.deserializePredicates(UserPreferences.Instance.LastQuery);

            if (unresolved > 0) {
                warnPartialRestore(unresolved);
            }
        }
    }

    function warnPartialRestore(count: number) {
        warningNotification("Query Partially Restored", `${count} atlas structure${count === 1 ? "" : "s"} in the saved query could not be identified. The query was reconstructed with the structures that could be, and has not been run.`);
    }

    return (
        <Stack justify="stretch" gap={0} style={{flexGrow: 1, minHeight: 0}}>
            <QueryPage/>
            <Footer/>
        </Stack>
    );
});
