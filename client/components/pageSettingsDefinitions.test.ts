import {describe, expect, it} from "vitest";

import {listKind, PageSettingsDefinition, PageSettingsKeys, readPageSettings, VersionedSettings} from "../util/pageSettings";
import {CandidatesSettings} from "./candidates/candidatesSettings";
import {ReconstructionsSettings} from "./reconstructions/reconstructionsSettings";
import {ReviewSettings} from "./review/reviewSettings";
import {AddSpecimensSettings} from "./neurons/addSpecimensSettings";
import {AdminSettings} from "./admin/adminSettings";
import {NeuronSettings} from "./neurons/neuronSettings";
import {AnnotationStatus} from "../models/annotationStatus";
import {AccessRequestStatus} from "../models/accessRequest";
import {NeuronStatus} from "../models/neuron";

const definitions: [string, PageSettingsDefinition<VersionedSettings>][] = [
    ["candidates", CandidatesSettings],
    ["reconstructions", ReconstructionsSettings],
    ["review", ReviewSettings],
    ["addSpecimens", AddSpecimensSettings],
    ["admin", AdminSettings],
    ["neuron", NeuronSettings]
];

function untypedLists(value: unknown, path: string): string[] {
    if (Array.isArray(value)) {
        return listKind(value) === undefined ? [path] : [];
    }

    if (value !== null && typeof value === "object") {
        return Object.entries(value).flatMap(([key, child]) => untypedLists(child, `${path}.${key}`));
    }

    return [];
}

function readWith<T extends VersionedSettings>(definition: PageSettingsDefinition<T>, change: (defaults: T) => object): T {
    return readPageSettings(definition, JSON.stringify(change(definition.defaults)));
}

describe("page settings definitions", () => {
    it.each(definitions)("%s defaults survive a round trip", (_, definition) => {
        expect(readPageSettings(definition, JSON.stringify(definition.defaults))).toEqual(definition.defaults);
    });

    it("use unique keys from PageSettingsKeys", () => {
        const keys = definitions.map(([, definition]) => definition.key);

        expect(new Set(keys).size).toBe(keys.length);
        expect(keys.every(key => Object.values(PageSettingsKeys).includes(key as any))).toBe(true);
    });

    it.each(definitions)("%s defaults record the element type of every list", (name, definition) => {
        expect(untypedLists(definition.defaults, name)).toEqual([]);
    });

    it("fall back for unknown admin tabs and publishing statuses, and prune access request statuses", () => {
        const settings = readWith(AdminSettings, d => ({
            ...d,
            tab: "nope",
            publishing: {...d.publishing, filters: {status: "nope"}},
            accessRequests: {...d.accessRequests, filters: {statuses: {enabled: true, contents: [AccessRequestStatus.Pending, AccessRequestStatus.Denied]}}}
        }));

        expect(settings.tab).toBe("users");
        expect(settings.publishing.filters.status).toBe("published");
        expect(settings.accessRequests.filters.statuses.contents).toEqual([AccessRequestStatus.Denied]);
    });

    it("fall back for unknown review and neuron tabs", () => {
        expect(readWith(ReviewSettings, d => ({...d, detailTab: "nope"})).detailTab).toBe("status");
        expect(readWith(NeuronSettings, d => ({...d, tab: "nope"})).tab).toBe("atlas");
    });

    it("drop obsolete review statuses but keep valid ones a user may not see", () => {
        const settings = readWith(ReviewSettings, d => ({...d, filters: {...d.filters, statuses: {enabled: true, contents: ["retired-status", "publish-review"]}}}));

        expect(settings.filters.statuses.contents).toEqual(["publish-review"]);
    });

    it("prune reconstruction statuses that can't be filtered on", () => {
        const settings = readWith(ReconstructionsSettings, d => ({
            ...d,
            filters: {...d.filters, statuses: {enabled: true, contents: [AnnotationStatus.InProgress, AnnotationStatus.Approved]}}
        }));

        expect(settings.filters.statuses.contents).toEqual([AnnotationStatus.InProgress]);
    });

    it("fall back for an unknown neuron status", () => {
        const settings = readWith(AddSpecimensSettings, d => ({
            ...d,
            neurons: {...d.neurons, filters: {...d.neurons.filters, status: {enabled: true, contents: 999}}}
        }));

        expect(settings.neurons.filters.status).toEqual({enabled: true, contents: NeuronStatus.Unpublished});
    });

    it("fall back for an invalid visible row count", () => {
        const settings = readWith(CandidatesSettings, d => ({...d, layout: {...d.layout, visibleRowCount: 13}}));

        expect(settings.layout.visibleRowCount).toBe(10);
    });
});
