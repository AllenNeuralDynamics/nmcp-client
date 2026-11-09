import {describe, expect, it} from "vitest";

import {
    countMetricsByStage,
    countMetricsByTags,
    countMetricsByStatus,
    groupMetricsByStatus,
    groupMetricsByTags,
    parseQualityOutputV2,
    parseQualityOutputV3,
    QualityMetric,
    toolMajorVersion
} from "./qualityControl";
import {v3Data, v3Document} from "../test/qualityControlFixtures";

function deepFreeze<T>(value: T): T {
    if (typeof value === "object" && value !== null) {
        Object.values(value).forEach(deepFreeze);
        Object.freeze(value);
    }
    return value;
}

const somaCount = {name: "Soma Count", safeName: "SomaCount", description: "Exactly one soma", nodes: []};
const shortBranch = {name: "Short Branch", safeName: "ShortBranch", description: "Branch below minimum length", nodes: [7]};
const danglingNodes = {name: "Dangling Nodes", safeName: "DanglingNodes", description: "Nodes without a parent", nodes: [1, 2, 3]};

describe("parseQualityOutputV2", () => {
    it("reads a stored v02 output", () => {
        const data = {
            serviceVersion: 2,
            toolVersion: "0.5.1",
            score: 400,
            passed: [somaCount],
            warnings: [shortBranch],
            errors: [danglingNodes],
            toolError: null,
            when: "2026-01-01T00:00:00.000Z"
        };

        expect(parseQualityOutputV2(data)).toEqual({passed: [somaCount], warnings: [shortBranch], errors: [danglingNodes]});
        expect(parseQualityOutputV2(data).toolError).toBeUndefined();
    });

    it("reads a stored v01 output, which has no passed bucket or safeName", () => {
        const output = parseQualityOutputV2({
            serviceVersion: 1,
            toolVersion: "0.1.0",
            warnings: [{name: "Short Branch", description: "Branch below minimum length", nodes: [7]}],
            errors: []
        });

        expect(output.passed).toEqual([]);
        expect(output.warnings).toEqual([{name: "Short Branch", description: "Branch below minimum length", nodes: [7]}]);
        expect(output.warnings[0]).not.toHaveProperty("safeName");
    });

    it.each([null, undefined, "output", 42, [danglingNodes]])("reads %j as an empty output", data => {
        expect(parseQualityOutputV2(data)).toEqual({passed: [], warnings: [], errors: []});
    });

    it("treats a bucket that is not an array as empty", () => {
        expect(parseQualityOutputV2({errors: {}}).errors).toEqual([]);
    });

    it("drops malformed entries and fills missing fields", () => {
        const output = parseQualityOutputV2({errors: ["text", null, 3, {nodes: [1, "2", null, 4]}, {name: "No Nodes", nodes: "1,2"}]});

        expect(output.errors).toEqual([
            {name: "", description: "", nodes: [1, 4]},
            {name: "No Nodes", description: "", nodes: []}
        ]);
    });

    it("reads a tool error with and without info", () => {
        expect(parseQualityOutputV2({toolError: {kind: "Timeout", description: "Took too long"}}).toolError)
            .toEqual({kind: "Timeout", description: "Took too long"});
        expect(parseQualityOutputV2({toolError: {kind: "Crash", description: "Exited", info: "code 1"}}).toolError)
            .toEqual({kind: "Crash", description: "Exited", info: "code 1"});
        expect(parseQualityOutputV2({toolError: null}).toolError).toBeUndefined();
    });

    it("leaves frozen input untouched and returns new arrays", () => {
        const data = deepFreeze({passed: [somaCount], warnings: [shortBranch], errors: [danglingNodes]});

        const output = parseQualityOutputV2(data);

        expect(output.errors).toEqual([danglingNodes]);
        expect(output.passed).not.toBe(data.passed);
        expect(output.warnings).not.toBe(data.warnings);
        expect(output.errors).not.toBe(data.errors);
        expect(output.errors[0]).not.toBe(data.errors[0]);
    });
});

describe("toolMajorVersion", () => {
    it.each([
        ["1.0.2", 1],
        ["1", 1],
        ["v2.3.0", 2],
        ["0.5.1", 0],
        ["unknown", null],
        ["", null],
        [null, null]
    ])("reads %j as %j", (toolVersion, major) => {
        expect(toolMajorVersion(toolVersion)).toBe(major);
    });
});

describe("parseQualityOutputV3", () => {
    it("reads metrics in document order", () => {
        const output = parseQualityOutputV3(v3Data);

        expect(output.error).toBeUndefined();
        expect(output.metrics.map(m => [m.name, m.status])).toEqual([
            ["required_columns", "Pass"],
            ["single_root_node", "Pass"],
            ["branch_max_degree", "Pending"],
            ["duplicate_node_coordinates", "Fail"]
        ]);
    });

    it("splits the description and reads stage, tags and neuroglancer locations", () => {
        const metrics = parseQualityOutputV3(v3Data).metrics;

        expect(metrics[3]).toEqual({
            name: "duplicate_node_coordinates",
            description: "2 node(s) in 1 group(s) share coordinates with another node.",
            details: ["Measurements: n_duplicate_groups=1"],
            status: "Fail",
            stage: "Processing",
            tags: {phase: "morphology"},
            value: "0",
            locationCount: 2
        });
        expect(metrics[2].locationCount).toBe(3);
        expect(metrics[0].locationCount).toBe(0);
    });

    it("reads tags as a map or a list, keeping only scalar values", () => {
        const metric = v3Document.metrics[0];
        const tags = (value: unknown) => parseQualityOutputV3({qualityControl: {metrics: [{...metric, tags: value}]}}).metrics[0].tags;

        expect(tags({phase: "integrity", rerun: true, nested: {a: 1}})).toEqual({phase: "integrity", rerun: "true"});
        expect(tags(["integrity", 2, null])).toEqual({tag_1: "integrity", tag_2: "2"});
        expect(tags(null)).toEqual({});
    });

    it("formats the metric value for display", () => {
        const metric = v3Document.metrics[0];
        const value = (v: unknown) => parseQualityOutputV3({qualityControl: {metrics: [{...metric, value: v}]}}).metrics[0].value;

        expect(value(4438)).toBe("4,438");
        expect(value(0.13972911963882617)).toBe("0.14");
        expect(value(21.64692807626907)).toBe("21.647");
        expect(value(true)).toBe("true");
        expect(value("ok")).toBe("ok");
        expect(value({a: 1})).toBe('{"a":1}');
        expect(value(null)).toBe("");
        expect(value(undefined)).toBe("");
    });

    it("uses the latest status in a metric's history", () => {
        const reviewed = {...v3Document, metrics: [{...v3Document.metrics[0], status_history: [{status: "Fail"}, {status: "Pass"}]}]};

        expect(parseQualityOutputV3({qualityControl: reviewed}).metrics[0].status).toBe("Pass");
    });

    it("reads a service error without a document", () => {
        const output = parseQualityOutputV3({
            ...v3Data,
            qualityControl: null,
            error: {stage: "standard_morph", kind: "ToolCrash", description: "standard_morph raised", info: null}
        });

        expect(output).toEqual({error: {stage: "standard_morph", kind: "ToolCrash", description: "standard_morph raised"}, metrics: [], groupings: [], statuses: {}});
    });

    it.each([null, undefined, "output", [], {qualityControl: {metrics: "none"}}])("reads %j as empty", data => {
        expect(parseQualityOutputV3(data)).toEqual({metrics: [], groupings: [], statuses: {}});
    });

    it("tolerates malformed metrics", () => {
        expect(parseQualityOutputV3({qualityControl: {metrics: [null, "x", {name: "untagged"}]}}).metrics)
            .toEqual([{name: "untagged", description: "", details: [], status: "", stage: "", tags: {}, value: "", locationCount: 0}]);
    });

    it("leaves frozen input untouched", () => {
        expect(() => parseQualityOutputV3(deepFreeze(structuredClone(v3Data)))).not.toThrow();
    });
});

function metric(name: string, status: string, stage = "Processing", tags: Record<string, string> = {}): QualityMetric {
    return {name, description: "", details: [], status, stage, tags, value: "", locationCount: 0};
}

describe("metric grouping and counts", () => {
    const metrics = [
        metric("a", "Pass"),
        metric("b", "Fail", "Raw data"),
        metric("c", "Pass", "Raw data"),
        metric("d", "Skipped"),
        metric("e", "Fail")
    ];

    it("groups by outcome, failures first and other statuses last, keeping document order", () => {
        expect(groupMetricsByStatus(metrics).map(g => [g.status, g.metrics.map(m => m.name)])).toEqual([
            ["Fail", ["b", "e"]],
            ["Pass", ["a", "c"]],
            ["Skipped", ["d"]]
        ]);
    });

    it("counts every known outcome, passes first, then other statuses", () => {
        expect([...countMetricsByStatus(metrics)]).toEqual([["Pass", 2], ["Fail", 2], ["Pending", 0], ["Skipped", 1]]);
    });

    it("counts by stage in the order stages first appear", () => {
        expect(countMetricsByStage(metrics).map(s => [s.values, s.total, s.counts.get("Pass"), s.counts.get("Fail"), s.counts.get("Skipped") ?? 0]))
            .toEqual([[["Processing"], 3, 1, 1, 1], [["Raw data"], 2, 1, 1, 0]]);
    });
});

describe("default grouping", () => {
    it("reads the document's groupings and status map", () => {
        const output = parseQualityOutputV3(v3Data);

        expect(output.groupings).toEqual([["phase"]]);
        expect(output.statuses).toEqual({"phase:morphology": "Fail", "phase:integrity": "Pass", "SPIM": "Fail", "Processing": "Fail"});
    });

    it("accepts single keys and key lists, dropping anything else", () => {
        const groupings = (value: unknown) => parseQualityOutputV3({qualityControl: {metrics: [], default_grouping: value}}).groupings;

        expect(groupings(["phase", ["probe", "shank"], [], 3, ""])).toEqual([["phase"], ["probe", "shank"]]);
        expect(groupings(undefined)).toEqual([]);
    });

    it("groups by a tag in first-seen order, failures first, with the document's group status", () => {
        const metrics = [
            metric("a", "Pass", "Processing", {phase: "integrity"}),
            metric("b", "Pass", "Processing", {phase: "morphology"}),
            metric("c", "Fail", "Processing", {phase: "morphology"}),
            metric("d", "Pass")
        ];

        expect(groupMetricsByTags(metrics, ["phase"], {"phase:integrity": "Pass", "phase:morphology": "Fail"})
            .map(g => [g.values, g.status, g.metrics.map(m => m.name)])).toEqual([
            [["integrity"], "Pass", ["a"]],
            [["morphology"], "Fail", ["c", "b"]],
            [[""], undefined, ["d"]]
        ]);
    });

    it("groups by several tags without a group status", () => {
        const metrics = [
            metric("a", "Pass", "Processing", {probe: "A", shank: "1"}),
            metric("b", "Pass", "Processing", {probe: "A", shank: "2"}),
            metric("c", "Pass", "Processing", {probe: "A", shank: "1"})
        ];

        expect(groupMetricsByTags(metrics, ["probe", "shank"], {"probe:A": "Pass"}).map(g => [g.values, g.status, g.metrics.map(m => m.name)])).toEqual([
            [["A", "1"], undefined, ["a", "c"]],
            [["A", "2"], undefined, ["b"]]
        ]);
    });
});

describe("countMetricsByTags", () => {
    it("counts by the grouping's tag values in first-seen order, with untagged metrics under an empty value", () => {
        const metrics = [
            metric("a", "Pass", "Processing", {phase: "integrity"}),
            metric("b", "Fail", "Processing", {phase: "morphology"}),
            metric("c", "Pending", "Processing", {phase: "morphology"}),
            metric("d", "Pass")
        ];

        expect(countMetricsByTags(metrics, ["phase"]).map(g => [g.values, g.total, [...g.counts]])).toEqual([
            [["integrity"], 1, [["Pass", 1], ["Fail", 0], ["Pending", 0]]],
            [["morphology"], 2, [["Pass", 0], ["Fail", 1], ["Pending", 1]]],
            [[""], 1, [["Pass", 1], ["Fail", 0], ["Pending", 0]]]
        ]);
    });
});
