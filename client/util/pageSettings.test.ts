import {beforeEach, describe, expect, it} from "vitest";

import {
    isPageSize,
    normalizeSettings,
    numberList,
    PageSettingsDefinition,
    readPageSettings,
    removeRetiredSettings,
    RetiredSettingsKeys,
    sanitizePagination,
    sectionOf,
    SettingsChange,
    stringList
} from "./pageSettings";

type Sample = {
    version: number;
    name: string;
    count: number;
    flag: boolean;
    selectedId: string | null;
    filter: { enabled: boolean, contents: string[] };
    statuses: number[];
    preset: number[];
    nested: { inner: { value: string } };
}

const defaults: Sample = {
    version: 1,
    name: "default",
    count: 3,
    flag: false,
    selectedId: null,
    filter: {enabled: false, contents: stringList()},
    statuses: numberList(),
    preset: numberList(7),
    nested: {inner: {value: "x"}}
};

const definition: PageSettingsDefinition<Sample> = {key: "test", defaults};

const read = (value: unknown) => readPageSettings(definition, JSON.stringify(value));

describe("readPageSettings", () => {
    it.each([
        ["nothing stored", null],
        ["malformed JSON", "{oops"],
        ["a JSON array", "[1, 2]"],
        ["a number", "42"]
    ])("returns the defaults for %s", (_, raw) => {
        expect(readPageSettings(definition, raw)).toBe(defaults);
    });

    it("returns the defaults for a missing or different version", () => {
        expect(read({...defaults, version: undefined, name: "kept?"})).toBe(defaults);
        expect(read({...defaults, version: 2, name: "kept?"})).toBe(defaults);
    });

    it("runs sanitize after normalization", () => {
        const sanitized = readPageSettings({...definition, sanitize: s => ({...s, count: s.count * 10})}, JSON.stringify({version: 1, count: 4, name: 5}));

        expect(sanitized.count).toBe(40);
        expect(sanitized.name).toBe("default");
    });
});

describe("normalizeSettings", () => {
    it("fills missing fields and drops extra ones", () => {
        const result = read({version: 1, name: "stored", extra: true});

        expect(result).toEqual({...defaults, name: "stored"});
        expect("extra" in result).toBe(false);
    });

    it("replaces a wrong-typed leaf while its siblings keep their stored values", () => {
        const result = read({version: 1, name: 12, count: 9, flag: true, nested: {inner: {value: 4}}});

        expect(result.name).toBe("default");
        expect(result.count).toBe(9);
        expect(result.flag).toBe(true);
        expect(result.nested.inner.value).toBe("x");
    });

    it("rejects lists of the wrong element type, including nested contents", () => {
        const result = read({version: 1, filter: {enabled: true, contents: [1, 2]}, statuses: ["a"]});

        expect(result.filter).toEqual({enabled: true, contents: []});
        expect(result.statuses).toEqual([]);
    });

    it("accepts empty lists and lists of the right type", () => {
        const result = read({version: 1, filter: {enabled: true, contents: ["a", "b"]}, statuses: [100, 200], preset: []});

        expect(result.filter.contents).toEqual(["a", "b"]);
        expect(result.statuses).toEqual([100, 200]);
        expect(result.preset).toEqual([]);
    });

    it("replaces a mixed list with the default", () => {
        expect(read({version: 1, preset: [1, "two"]}).preset).toEqual([7]);
    });

    it("rejects any non-empty stored list for an array default not made with the helpers", () => {
        expect(normalizeSettings({list: [] as string[]}, {list: ["a"]})).toEqual({list: []});
    });

    it("accepts strings for null-default fields and rejects other values", () => {
        expect(read({version: 1, selectedId: "rec-1"}).selectedId).toBe("rec-1");
        expect(read({version: 1, selectedId: 5}).selectedId).toBeNull();
        expect(read({version: 1, selectedId: {}}).selectedId).toBeNull();
    });

    it("rejects strings for number fields", () => {
        expect(read({version: 1, count: "9"}).count).toBe(3);
    });
});

describe("removeRetiredSettings", () => {
    beforeEach(() => localStorage.clear());

    it("removes exactly the retired keys", () => {
        for (const key of RetiredSettingsKeys) {
            localStorage.setItem(key, "x");
        }

        localStorage.setItem("nmcp:viewer.lastQuery", "[]");
        localStorage.setItem("nmcp:app.layout", "{}");
        localStorage.setItem("nmcp:page.admin", "{}");

        removeRetiredSettings();

        expect(RetiredSettingsKeys).toHaveLength(12);
        expect(RetiredSettingsKeys.filter(key => localStorage.getItem(key) !== null)).toEqual([]);
        expect(localStorage.getItem("nmcp:viewer.lastQuery")).toBe("[]");
        expect(localStorage.getItem("nmcp:app.layout")).toBe("{}");
        expect(localStorage.getItem("nmcp:page.admin")).toBe("{}");
    });

    it("tolerates blocked storage", () => {
        expect(() => removeRetiredSettings(() => {
            throw new Error("blocked");
        })).not.toThrow();

        expect(() => removeRetiredSettings(() => ({
            removeItem: () => {
                throw new Error("blocked");
            }
        }))).not.toThrow();
    });
});

describe("sectionOf", () => {
    it("changes only its section and passes it the current section", () => {
        let state = {a: {value: 1}, b: {value: 2}};

        const update: SettingsChange<typeof state> = change => state = change(state);

        const updateA = sectionOf(update, "a");

        updateA(a => ({value: a.value + 10}));
        updateA(a => ({value: a.value + 10}));

        expect(state).toEqual({a: {value: 21}, b: {value: 2}});
    });
});

describe("pagination", () => {
    it("accepts slider page sizes only", () => {
        expect([10, 15, 50].every(isPageSize)).toBe(true);
        expect([5, 12, 55, 10.5].some(isPageSize)).toBe(false);
    });

    it("sanitizes offsets and limits", () => {
        expect(sanitizePagination({offset: 20, limit: 25})).toEqual({offset: 20, limit: 25});
        expect(sanitizePagination({offset: -1, limit: 7})).toEqual({offset: 0, limit: 10});
        expect(sanitizePagination({offset: 2.5, limit: 60})).toEqual({offset: 0, limit: 10});
    });
});
