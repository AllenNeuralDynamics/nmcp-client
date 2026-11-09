import * as React from "react";
import {useEffect} from "react";
import {beforeEach, describe, expect, it} from "vitest";
import {act, render, renderHook} from "@testing-library/react";

import {usePageSettings} from "./usePageSettings";
import {PageSettingsDefinition, SettingsChange, stringList} from "../util/pageSettings";

type Settings = {
    version: number;
    a: number;
    b: number;
    ids: string[];
}

const definition: PageSettingsDefinition<Settings> = {
    key: "nmcp:page.test",
    defaults: {version: 1, a: 0, b: 0, ids: stringList()}
};

const stored = () => JSON.parse(localStorage.getItem(definition.key));

describe("usePageSettings", () => {
    beforeEach(() => localStorage.clear());

    it("has the stored value on the first render", () => {
        localStorage.setItem(definition.key, JSON.stringify({version: 1, a: 5, b: 6, ids: ["x"]}));

        const renders: Settings[] = [];

        const Page = () => {
            const [settings] = usePageSettings(definition);
            renders.push(settings);
            return null;
        };

        render(<Page/>);

        expect(renders[0]).toEqual({version: 1, a: 5, b: 6, ids: ["x"]});
    });

    it("writes storage synchronously and re-renders with the new value", () => {
        const {result} = renderHook(() => usePageSettings(definition));

        act(() => {
            result.current[1](s => ({...s, a: 3}));
            expect(stored().a).toBe(3);
        });

        expect(result.current[0].a).toBe(3);
    });

    it("composes updates made in one act", () => {
        const {result} = renderHook(() => usePageSettings(definition));

        act(() => {
            result.current[1](s => ({...s, a: s.a + 1}));
            result.current[1](s => ({...s, a: s.a + 1, b: 7}));
        });

        expect(result.current[0]).toMatchObject({a: 2, b: 7});
        expect(stored()).toMatchObject({a: 2, b: 7});
    });

    it("keeps updates a child makes while the page mounts", () => {
        let latest: Settings = null;

        const Child = ({update}: { update: SettingsChange<Settings> }) => {
            useEffect(() => {
                update(s => ({...s, a: 1}));
                update(s => ({...s, b: 2}));
            }, []);
            return null;
        };

        const Page = () => {
            const [settings, update] = usePageSettings(definition);
            latest = settings;
            return <Child update={update}/>;
        };

        render(<Page/>);

        expect(latest).toMatchObject({a: 1, b: 2});
        expect(stored()).toMatchObject({a: 1, b: 2});
    });

    it("normalizes the stored entry on mount", () => {
        localStorage.setItem(definition.key, JSON.stringify({version: 2, a: 9}));

        const {unmount} = renderHook(() => usePageSettings(definition));

        expect(stored()).toEqual(definition.defaults);

        unmount();

        localStorage.setItem(definition.key, JSON.stringify({version: 1, a: 4, extra: true}));

        renderHook(() => usePageSettings(definition));

        expect(stored()).toEqual({version: 1, a: 4, b: 0, ids: []});
    });
});
