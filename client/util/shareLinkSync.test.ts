import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {observable, runInAction} from "mobx";

import {consumeShareFragment, ShareSources, startShareLinkSync} from "./shareLinkSync";
import {parseShareFragment, shareState, shareUrl} from "./shareLink";
import {QueryStatus} from "../viewmodel/queryResponseViewModel";

const page = observable({predicate: "a", layout: "docked", status: QueryStatus.Loaded, viewer: {} as object | null, camera: 1});

const sources = {
    uiQuery: {serialize: () => ({predicates: [page.predicate]})},
    queryResponse: {
        get status() {
            return page.status;
        },
        serialize: () => ({neurons: []})
    },
    appLayout: {serialize: () => ({drawer: page.layout})},
    searchViewerRef: {
        get viewer() {
            return page.viewer;
        },
        get shareableState() {
            return {camera: page.camera};
        }
    }
} as unknown as ShareSources;

const recorded = () => parseShareFragment(window.location.hash);

const set = (changes: Partial<typeof page>) => runInAction(() => Object.assign(page, changes));

describe("share link sync", () => {
    let stop: () => void;
    const reload = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        reload.mockClear();
        set({predicate: "a", layout: "docked", status: QueryStatus.Loaded, viewer: {}, camera: 1});
        window.history.replaceState({router: "entry"}, "", "/");
        stop = startShareLinkSync(sources, reload);
    });

    afterEach(() => {
        stop();
        vi.useRealTimers();
    });

    it("records the page as soon as it starts, keeping the path and the router's history state", () => {
        expect(recorded()).toMatchObject({query: {predicates: ["a"]}, response: {neurons: []}, layout: {drawer: "docked"}, viewer: {camera: 1}});
        expect(window.location.pathname).toBe("/");
        expect(window.history.state).toEqual({router: "entry"});
    });

    it("records a change once the delay has passed, without adding history entries", () => {
        const length = window.history.length;

        set({camera: 2});
        set({layout: "hidden"});

        vi.advanceTimersByTime(100);
        expect(recorded()).toMatchObject({layout: {drawer: "docked"}, viewer: {camera: 1}});

        vi.advanceTimersByTime(300);
        expect(recorded()).toMatchObject({layout: {drawer: "hidden"}, viewer: {camera: 2}});
        expect(window.history.length).toBe(length);
    });

    it("records nothing while a query is in flight", () => {
        set({status: QueryStatus.Loading, predicate: "b"});
        vi.advanceTimersByTime(1000);
        expect(recorded()).toMatchObject({query: {predicates: ["a"]}});

        set({status: QueryStatus.Loaded});
        vi.advanceTimersByTime(1000);
        expect(recorded()).toMatchObject({query: {predicates: ["b"]}});
    });

    it("records no results before a query has run", () => {
        set({status: QueryStatus.NeverQueried});
        vi.advanceTimersByTime(1000);

        expect(recorded().response).toBeNull();
    });

    it("records nothing without a viewer", () => {
        set({viewer: null, predicate: "b"});
        vi.advanceTimersByTime(1000);

        expect(recorded()).toMatchObject({query: {predicates: ["a"]}});
    });

    it("stops recording when stopped", () => {
        stop();

        set({predicate: "b"});
        vi.advanceTimersByTime(1000);

        expect(recorded()).toMatchObject({query: {predicates: ["a"]}});
    });

    it("does not treat its own fragment as a share link to restore", () => {
        expect(consumeShareFragment()).toBeNull();
    });

    it("loads a share link entered over the page's own URL", () => {
        const other = shareUrl("/", shareState({query: null, response: null, layout: null, viewer: null}));

        window.history.replaceState(null, "", other);
        window.dispatchEvent(new HashChangeEvent("hashchange"));

        expect(reload).toHaveBeenCalledTimes(1);
    });

    it("ignores fragments that are not share links", () => {
        window.history.replaceState(null, "", "/#section");
        window.dispatchEvent(new HashChangeEvent("hashchange"));

        expect(reload).not.toHaveBeenCalled();
    });
});
