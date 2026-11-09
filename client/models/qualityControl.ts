export enum QualityControlTestKind {
    Error = 100,
    Warning = 200,
    Passed = 300
}

// Mirrors nmcp-api's QualityControlServiceVersion, listing only the output versions this client can render.
export enum QualityControlServiceVersion {
    v01 = 1,
    v02 = 2,
    v03 = 3
}

// The standard-morph major version whose v03 metrics this client renders.  A later major can rename or regroup the
// metrics, so it is treated as an unknown format rather than shown with possibly wrong meaning.
export const SupportedV3ToolMajorVersion = 1;

export type QualityControlTest = {
    name: string;
    safeName?: string;
    description: string;
    nodes: number[];
}

export type QualityControlToolError = {
    kind: string;
    description: string;
    info?: string;
}

export type QualityOutput = {
    serviceVersion: number;
    toolVersion: string;
    when?: Date;
    data?: unknown;
}

// Stored v01 and v02 outputs; v01 lacks the passed bucket and safeName, so it parses into the same shape.
export type QualityOutputV2 = {
    passed: QualityControlTest[];
    warnings: QualityControlTest[];
    errors: QualityControlTest[];
    toolError?: QualityControlToolError;
}

// aind-data-schema QC statuses; anything else a document carries is passed through as is.
export enum QualityMetricStatus {
    Pass = "Pass",
    Fail = "Fail",
    Pending = "Pending"
}

export type QualityMetric = {
    name: string;
    description: string;
    // The " | "-separated sections after the summary, such as "Thresholds: ..." and "Measurements: ...".
    details: string[];
    status: string;
    stage: string;
    // Key to value, in document order, such as {phase: "morphology"}.
    tags: Record<string, string>;
    // Display form of the metric's value, which the schema leaves untyped; empty when absent.
    value: string;
    // Neuroglancer locations in the metric's reference.
    locationCount: number;
}

export type QualityControlServiceError = {
    stage: string;
    kind: string;
    description: string;
    info?: string;
}

// Stored v03 outputs: the QC-portal document's metrics in document order, plus any service-side error.
export type QualityOutputV3 = {
    error?: QualityControlServiceError;
    metrics: QualityMetric[];
    // The document's default_grouping: each entry is the tag keys of one grouping, such as [["phase"]].
    groupings: string[][];
    // The document's computed status map, keyed "<tag key>:<tag value>" (as well as by modality and stage).
    statuses: Record<string, string>;
}

export type QualityMetricStatusGroup = {
    status: string;
    metrics: QualityMetric[];
}

export type QualityMetricTagGroup = {
    // One value per grouping key; empty strings for a metric that lacks the key.
    values: string[];
    // The document's status for the group, when the grouping has a single key.
    status?: string;
    metrics: QualityMetric[];
}

export type QualityMetricBreakdown = {
    // One value per breakdown key, such as [stage] or one tag value per grouping key.
    values: string[];
    counts: Map<string, number>;
    total: number;
}

export function toolMajorVersion(toolVersion: string): number | null {
    const match = /^v?(\d+)(\.|$)/.exec(toolVersion ?? "");

    return match ? parseInt(match[1], 10) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOrEmpty(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function parseTests(value: unknown): QualityControlTest[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter(isRecord).map(entry => {
        const test: QualityControlTest = {
            name: stringOrEmpty(entry.name),
            description: stringOrEmpty(entry.description),
            nodes: Array.isArray(entry.nodes) ? entry.nodes.filter((n): n is number => typeof n === "number") : []
        };

        if (typeof entry.safeName === "string") {
            test.safeName = entry.safeName;
        }

        return test;
    });
}

function parseToolError(value: unknown): QualityControlToolError | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    const toolError: QualityControlToolError = {
        kind: stringOrEmpty(value.kind),
        description: stringOrEmpty(value.description)
    };

    if (typeof value.info === "string") {
        toolError.info = value.info;
    }

    return toolError;
}

// Apollo freezes query results in development, so this builds new objects rather than normalizing data in place.
export function parseQualityOutputV2(data: unknown): QualityOutputV2 {
    if (!isRecord(data)) {
        return {passed: [], warnings: [], errors: []};
    }

    const output: QualityOutputV2 = {
        passed: parseTests(data.passed),
        warnings: parseTests(data.warnings),
        errors: parseTests(data.errors)
    };

    const toolError = parseToolError(data.toolError);

    if (toolError) {
        output.toolError = toolError;
    }

    return output;
}

function parseServiceError(value: unknown): QualityControlServiceError | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    const error: QualityControlServiceError = {
        stage: stringOrEmpty(value.stage),
        kind: stringOrEmpty(value.kind),
        description: stringOrEmpty(value.description)
    };

    if (typeof value.info === "string") {
        error.info = value.info;
    }

    return error;
}

function latestStatus(history: unknown): string {
    const entries = Array.isArray(history) ? history.filter(isRecord) : [];

    return entries.length > 0 ? stringOrEmpty(entries[entries.length - 1].status) : "";
}

function isScalar(value: unknown): value is string | number | boolean {
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

// aind-data-schema 2.x stores tags as a key/value map.  Pre-2.3 documents stored a list of strings, which the schema's
// fix_tag_lists validator converts to tag_1, tag_2, ...; the same keys are used here.
function parseTags(value: unknown): Record<string, string> {
    const entries: [string, unknown][] = Array.isArray(value)
        ? value.map((v, i): [string, unknown] => [`tag_${i + 1}`, v])
        : isRecord(value) ? Object.entries(value) : [];

    return Object.fromEntries(entries.filter(([, v]) => isScalar(v)).map(([k, v]) => [k, String(v)]));
}

// Each default_grouping entry is a single tag key or a list of them.
function parseGroupings(value: unknown): string[][] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map(entry => (Array.isArray(entry) ? entry : [entry]).filter((key): key is string => typeof key === "string" && key.length > 0))
        .filter(keys => keys.length > 0);
}

function parseStatuses(value: unknown): Record<string, string> {
    return isRecord(value) ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : {};
}

const metricNumberFormat = new Intl.NumberFormat("en-US", {maximumFractionDigits: 3});

function formatMetricValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "number") {
        return metricNumberFormat.format(value);
    }

    return isScalar(value) ? String(value) : JSON.stringify(value);
}

function parseMetric(entry: Record<string, unknown>): QualityMetric {
    const [description = "", ...details] = stringOrEmpty(entry.description).split(" | ");

    return {
        name: stringOrEmpty(entry.name),
        description,
        details,
        status: latestStatus(entry.status_history),
        stage: stringOrEmpty(entry.stage),
        tags: parseTags(entry.tags),
        value: formatMetricValue(entry.value),
        locationCount: (stringOrEmpty(entry.reference).match(/action=goto:/g) ?? []).length
    };
}

export function parseQualityOutputV3(data: unknown): QualityOutputV3 {
    const output: QualityOutputV3 = {metrics: [], groupings: [], statuses: {}};

    if (!isRecord(data)) {
        return output;
    }

    const error = parseServiceError(data.error);

    if (error) {
        output.error = error;
    }

    const document = data.qualityControl;

    if (isRecord(document) && Array.isArray(document.metrics)) {
        output.metrics = document.metrics.filter(isRecord).map(parseMetric);
        output.groupings = parseGroupings(document.default_grouping);
        output.statuses = parseStatuses(document.status);
    }

    return output;
}

// Tables lead with failures; the summary counts lead with passes.  Any other status a document carries follows the known
// outcomes, in the order first seen.
export const MetricTableStatusOrder: string[] = [QualityMetricStatus.Fail, QualityMetricStatus.Pending, QualityMetricStatus.Pass];
export const MetricSummaryStatusOrder: string[] = [QualityMetricStatus.Pass, QualityMetricStatus.Fail, QualityMetricStatus.Pending];

function orderedStatuses(metrics: QualityMetric[], known: string[]): string[] {
    return [...known, ...new Set(metrics.map(m => m.status).filter(s => !known.includes(s)))];
}

// Only outcomes with at least one metric; within each, metrics keep document order.
export function groupMetricsByStatus(metrics: QualityMetric[]): QualityMetricStatusGroup[] {
    return orderedStatuses(metrics, MetricTableStatusOrder)
        .map(status => ({status, metrics: metrics.filter(m => m.status === status)}))
        .filter(group => group.metrics.length > 0);
}

function byTableStatusOrder(metrics: QualityMetric[]): QualityMetric[] {
    const order = orderedStatuses(metrics, MetricTableStatusOrder);

    return [...metrics].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
}

// Groups keep the order their first metric appears in; within a group, failures come first.
export function groupMetricsByTags(metrics: QualityMetric[], keys: string[], statuses: Record<string, string>): QualityMetricTagGroup[] {
    const groups = new Map<string, QualityMetricTagGroup>();

    for (const metric of metrics) {
        const values = keys.map(key => metric.tags[key] ?? "");
        const id = JSON.stringify(values);

        if (!groups.has(id)) {
            const status = keys.length === 1 ? statuses[`${keys[0]}:${values[0]}`] : undefined;
            groups.set(id, {values, ...(status ? {status} : {}), metrics: []});
        }

        groups.get(id).metrics.push(metric);
    }

    return [...groups.values()].map(group => ({...group, metrics: byTableStatusOrder(group.metrics)}));
}

// Every known outcome, zero or not, then any other status that occurs.
export function countMetricsByStatus(metrics: QualityMetric[]): Map<string, number> {
    return new Map(orderedStatuses(metrics, MetricSummaryStatusOrder).map(status => [status, metrics.filter(m => m.status === status).length]));
}

// Breakdown rows in the order first seen.  Each row's counts carry only the statuses that row has beyond the known ones,
// so a table across rows should take its columns from the overall counts.
export function countMetricsByGroup(metrics: QualityMetric[], valuesOf: (metric: QualityMetric) => string[]): QualityMetricBreakdown[] {
    const groups = new Map<string, { values: string[], metrics: QualityMetric[] }>();

    for (const metric of metrics) {
        const values = valuesOf(metric);
        const id = JSON.stringify(values);

        if (!groups.has(id)) {
            groups.set(id, {values, metrics: []});
        }

        groups.get(id).metrics.push(metric);
    }

    return [...groups.values()].map(({values, metrics: inGroup}) => ({values, counts: countMetricsByStatus(inGroup), total: inGroup.length}));
}

export function countMetricsByStage(metrics: QualityMetric[]): QualityMetricBreakdown[] {
    return countMetricsByGroup(metrics, metric => [metric.stage]);
}

// A metric that lacks a key counts under an empty value for it.
export function countMetricsByTags(metrics: QualityMetric[], keys: string[]): QualityMetricBreakdown[] {
    return countMetricsByGroup(metrics, metric => keys.map(key => metric.tags[key] ?? ""));
}
