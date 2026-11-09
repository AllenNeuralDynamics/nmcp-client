import {comparer, reaction} from "mobx";

import {FragmentPrefix, parseShareFragment, ShareContent, ShareState, shareFragment, shareState} from "./shareLink";
import {UIQuery} from "../viewmodel/uiQuery";
import {QueryResponseViewModel, QueryStatus} from "../viewmodel/queryResponseViewModel";
import {AppLayout} from "../viewmodel/appLayout";
import {SearchViewerRef} from "../viewmodel/searchViewerRef";

export type ShareSources = {
    uiQuery: UIQuery;
    queryResponse: QueryResponseViewModel;
    appLayout: AppLayout;
    searchViewerRef: SearchViewerRef;
}

// On top of the viewer's own 500 ms debounce of its state changes.
const WriteDelayMs = 250;

// The fragment this page last wrote or restored from.  A fragment equal to it describes state already in memory: a
// return to the search page from elsewhere in the app, or a second run of the restore effect.
let currentFragment: string | null = null;

// The share state in the URL, once per fragment.  Throws on a malformed one.
export function consumeShareFragment(): ShareState | null {
    const hash = window.location.hash;

    if (hash === currentFragment) {
        return null;
    }

    currentFragment = hash;

    return parseShareFragment(hash);
}

// Null while there is nothing settled to record: a query in flight, or no viewer to read from.  Results are recorded
// only once a query has run, so a restore runs the query only when the page it came from had.
export function captureShareContent({uiQuery, queryResponse, appLayout, searchViewerRef}: ShareSources): ShareContent | null {
    if (queryResponse.status == QueryStatus.Loading || searchViewerRef.viewer == null) {
        return null;
    }

    return {
        query: uiQuery.serialize(),
        response: queryResponse.status == QueryStatus.Loaded ? queryResponse.serialize() : null,
        layout: appLayout.serialize(),
        viewer: searchViewerRef.shareableState
    };
}

// Keeps the URL fragment in step with the page.  The URL is only ever written here and read once, at load, so a write
// can never feed back into a restore.
export function startShareLinkSync(sources: ShareSources, reload: () => void = () => window.location.reload()): () => void {
    const write = (content: ShareContent | null) => {
        if (content == null) {
            return;
        }

        // Replaced rather than pushed, so state changes do not pile up as history entries, and with the existing
        // history state, which the router keeps its own entry data in.
        window.history.replaceState(window.history.state, "", shareFragment(shareState(content)));

        currentFragment = window.location.hash;
    };

    const disposeReaction = reaction(() => captureShareContent(sources), write, {fireImmediately: true, delay: WriteDelayMs, equals: comparer.structural});

    // A share link entered over this page's own URL differs only in the fragment, which the browser navigates to
    // without a load.  Loading it is the one restore path, so take it.
    const onHashChange = () => {
        const hash = window.location.hash;

        if (hash !== currentFragment && hash.startsWith(FragmentPrefix)) {
            reload();
        }
    };

    window.addEventListener("hashchange", onHashChange);

    return () => {
        disposeReaction();
        window.removeEventListener("hashchange", onHashChange);
    };
}
