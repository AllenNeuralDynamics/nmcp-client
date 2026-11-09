import {describe, expect, it} from "vitest";
import {deflateSync, strToU8} from "fflate";

import {toBase64Url} from "./crypto";

import {parseShareFragment, ShareState, shareUrl, ShareStateVersion} from "./shareLink";

const state = {
    timestamp: 1,
    version: ShareStateVersion,
    query: {predicates: [{id: "p", index: 0, brainAreaFilterTypeOption: 1, filter: {labelsOrDois: "a+b > c ~ d? 100% #1 → é 'q' & x=y"}}]},
    response: {neurons: [{neuronId: "n1", baseColor: "#ff00aa", viewModeId: "full", isSelected: true, isMirrored: false}]},
    layout: null,
    viewer: {layers: [{name: "CCF", segments: ["997"]}]}
} as unknown as ShareState;

describe("share link", () => {
    it("round-trips characters that base64 in a query parameter could not carry", () => {
        const url = shareUrl("https://host/", state);

        expect(parseShareFragment(new URL(url).hash)).toEqual(state);
    });

    it("keeps the state out of the part of the URL sent to the server", () => {
        const url = new URL(shareUrl("https://host/", state));

        expect(url.search).toBe("");
        expect(url.pathname).toBe("/");
    });

    it("returns null without share state", () => {
        expect(parseShareFragment("")).toBeNull();
        expect(parseShareFragment("#section")).toBeNull();
    });

    it("uses only characters no browser escapes or rewrites", () => {
        const fragment = new URL(shareUrl("https://host/", state)).hash;

        expect(fragment).toMatch(/^#![A-Za-z0-9_-]+$/);
        expect(encodeURI(fragment)).toBe(fragment);
    });

    it("compresses repetitive state well below its JSON length", () => {
        const neurons = Array.from({length: 100}, (_, i) => ({neuronId: `01a0d377-5700-7f7d-b180-${i.toString().padStart(12, "0")}`, baseColor: "#0050FF"}));
        const large = {...state, response: {neurons}} as ShareState;

        expect(shareUrl("", large).length).toBeLessThan(JSON.stringify(large).length / 4);
    });

    it("throws on malformed share state", () => {
        const compressed = (json: string) => "#!" + toBase64Url(deflateSync(strToU8(json)));

        expect(() => parseShareFragment("#!{")).toThrow();
        expect(() => parseShareFragment("#!abc$")).toThrow();
        expect(() => parseShareFragment("#!AAAA")).toThrow();
        expect(() => parseShareFragment(compressed("{"))).toThrow();
        expect(() => parseShareFragment(compressed("[1]"))).toThrow();
        expect(() => parseShareFragment(compressed("null"))).toThrow();
    });
});
