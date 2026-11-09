import {deflateSync, inflateSync, strFromU8, strToU8} from "fflate";
import {bigintToStringJsonReplacer} from "neuroglancer/unstable/util/json.js";

import {fromBase64Url, toBase64Url} from "./crypto";
import {UIQueryState} from "../viewmodel/uiQuery";
import {QueryResponseState} from "../viewmodel/queryResponseViewModel";
import {AppLayoutState} from "../viewmodel/appLayout";

export const ShareStateVersion = 2;

export type ShareState = {
    timestamp: number;
    version: number;
    query: UIQueryState;
    response: QueryResponseState;
    layout: AppLayoutState;
    viewer: object | null;
}

export type ShareContent = Omit<ShareState, "timestamp" | "version">;

export const FragmentPrefix = "#!";

export function shareState(content: ShareContent): ShareState {
    return {timestamp: Date.now(), version: ShareStateVersion, ...content};
}

// The state goes in the fragment, which browsers never send to the server, so a large result is held only to the
// browser's URL limit and not to the request-line limits of nginx or Node.  It is compressed because Safari cuts a URL
// copied from its address bar at 4,096 characters, and base64url so every character is legal in a fragment and no
// browser rewrites it.
export function shareFragment(state: ShareState): string {
    return FragmentPrefix + toBase64Url(deflateSync(strToU8(JSON.stringify(state, bigintToStringJsonReplacer)), {level: 9}));
}

export function shareUrl(baseUrl: string, state: ShareState): string {
    return `${baseUrl}${shareFragment(state)}`;
}

// Null when the hash holds no share state; throws when it holds a malformed one.
export function parseShareFragment(hash: string): ShareState | null {
    if (!hash.startsWith(FragmentPrefix)) {
        return null;
    }

    const state = JSON.parse(strFromU8(inflateSync(fromBase64Url(hash.slice(FragmentPrefix.length)))));

    if (state == null || typeof state !== "object" || Array.isArray(state)) {
        throw new Error("share state is not an object");
    }

    return state;
}
