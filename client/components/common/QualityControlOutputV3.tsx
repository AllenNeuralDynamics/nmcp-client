import * as React from "react";
import {useId, useState} from "react";
import {Badge, Card, Group, Select, Stack, Switch, Table, Text} from "@mantine/core";

import {
    countMetricsByStage,
    countMetricsByStatus,
    countMetricsByTags,
    groupMetricsByStatus,
    groupMetricsByTags,
    QualityMetric,
    QualityMetricStatus,
    QualityOutputV3
} from "../../models/qualityControl";
import {QualityOutputHeader} from "./QualityOutputHeader";

// Pending covers the document's upstream, review, error and skipped results, which nmcp-api scores as warnings.
function statusLabel(status: string): string {
    switch (status) {
        case QualityMetricStatus.Pass:
            return "Passed";
        case QualityMetricStatus.Fail:
            return "Failed";
        case QualityMetricStatus.Pending:
            return "Warning";
        default:
            return status || "Unknown";
    }
}

function statusColor(status: string): string {
    switch (status) {
        case QualityMetricStatus.Pass:
            return "green";
        case QualityMetricStatus.Fail:
            return "red";
        case QualityMetricStatus.Pending:
            return "yellow";
        default:
            return "gray";
    }
}

function displayName(name: string): string {
    return name.split(/[_\s]+/).filter(w => w.length > 0).map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

const StatusGrouping = "status";
const NoGrouping = "none";

function tagGrouping(keys: string[]): string {
    return `tags:${JSON.stringify(keys)}`;
}

type GroupingOption = { value: string; label: string; keys?: string[] };

// Pass/Fail always first and None always last, with the document's default groupings in between.
function groupingOptions(groupings: string[][]): GroupingOption[] {
    const tagOptions = new Map(groupings.map(keys => [tagGrouping(keys), {value: tagGrouping(keys), label: keys.map(displayName).join(" / "), keys}]));

    return [{value: StatusGrouping, label: "Pass/Fail"}, ...tagOptions.values(), {value: NoGrouping, label: "None"}];
}

function tagValuesLabel(values: string[]): string {
    return values.map(v => displayName(v) || "Other").join(" / ");
}

// Broken out by the document's first default grouping when it has one, otherwise by stage.
const MetricSummary = ({metrics, grouping}: { metrics: QualityMetric[], grouping?: string[] }) => {
    const totals = countMetricsByStatus(metrics);
    const statuses = [...totals.keys()];
    const breakdown = grouping
        ? {title: grouping.map(displayName).join(" / "), rows: countMetricsByTags(metrics, grouping), label: tagValuesLabel}
        : {title: "Stage", rows: countMetricsByStage(metrics), label: (values: string[]) => values[0] || "Unspecified"};

    return (
        <Card withBorder>
            <Card.Section p={8} bg="table-header">
                <Text fw={500}>Summary</Text>
            </Card.Section>
            <Card.Section p={12}>
                <Stack gap="sm">
                    <Group gap="xs">
                        {statuses.map(status => (
                            <Badge key={status} color={statusColor(status)} variant="light" size="md">
                                {statusLabel(status)}: {totals.get(status)}
                            </Badge>
                        ))}
                    </Group>
                    <Table>
                        <Table.Thead bg="table-header">
                            <Table.Tr>
                                <Table.Th>{breakdown.title}</Table.Th>
                                {statuses.map(status => <Table.Th key={status}>{statusLabel(status)}</Table.Th>)}
                                <Table.Th>Total</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody bg="table">
                            {breakdown.rows.map(({values, counts, total}) => (
                                <Table.Tr key={JSON.stringify(values)}>
                                    <Table.Td>{breakdown.label(values)}</Table.Td>
                                    {statuses.map(status => <Table.Td key={status}>{counts.get(status) ?? 0}</Table.Td>)}
                                    <Table.Td>{total}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Stack>
            </Card.Section>
        </Card>
    );
}

type MetricTableProps = {
    title: string;
    color: string;
    metrics: QualityMetric[];
    // Redundant when every row in the table has the same status.
    showStatus: boolean;
}

const MetricTable = ({title, color, metrics, showStatus}: MetricTableProps) => {
    return (
        <Card withBorder>
            <Card.Section bg={`var(--mantine-color-${color}-light)`} p={8}>
                <Text fw={500}>{title}</Text>
            </Card.Section>
            <Card.Section>
                <Table>
                    <Table.Thead bg="table-header">
                        <Table.Tr>
                            {showStatus ? <Table.Th>Status</Table.Th> : null}
                            <Table.Th>Metric</Table.Th>
                            <Table.Th>Value</Table.Th>
                            <Table.Th>Locations</Table.Th>
                            <Table.Th>Description</Table.Th>
                            <Table.Th>Stage</Table.Th>
                            <Table.Th>Tags</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody bg="table">
                        {metrics.map((metric, idx) => (
                            <Table.Tr key={idx}>
                                {showStatus ? (
                                    <Table.Td>
                                        <Badge color={statusColor(metric.status)} variant="light">{statusLabel(metric.status)}</Badge>
                                    </Table.Td>
                                ) : null}
                                <Table.Td>
                                    <Stack gap={2}>
                                        <Text size="sm">{displayName(metric.name)}</Text>
                                        <Text size="xs" c="dimmed">{metric.name}</Text>
                                    </Stack>
                                </Table.Td>
                                <Table.Td>{metric.value}</Table.Td>
                                <Table.Td>{metric.locationCount > 0 ? metric.locationCount : null}</Table.Td>
                                <Table.Td>
                                    <Stack gap={2}>
                                        <Text size="sm">{metric.description}</Text>
                                        {metric.details.map((detail, d) => <Text key={d} size="xs" c="dimmed">{detail}</Text>)}
                                    </Stack>
                                </Table.Td>
                                <Table.Td>{metric.stage}</Table.Td>
                                <Table.Td>
                                    <Group gap={4}>
                                        {Object.entries(metric.tags).map(([key, value]) => (
                                            <Badge key={key} color="gray" variant="light">{key}: {value}</Badge>
                                        ))}
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Card.Section>
        </Card>
    );
}

function metricTables(output: QualityOutputV3, metrics: QualityMetric[], option: GroupingOption) {
    if (option.keys) {
        return groupMetricsByTags(metrics, option.keys, output.statuses).map(group => {
            const title = tagValuesLabel(group.values);

            return <MetricTable key={JSON.stringify(group.values)} title={group.status ? `${title}: ${statusLabel(group.status)}` : title}
                                color={statusColor(group.status)} metrics={group.metrics} showStatus={true}/>;
        });
    }

    if (option.value === NoGrouping) {
        return <MetricTable title="All Metrics" color="gray" metrics={metrics} showStatus={true}/>;
    }

    return groupMetricsByStatus(metrics).map(group => (
        <MetricTable key={group.status} title={statusLabel(group.status)} color={statusColor(group.status)} metrics={group.metrics} showStatus={false}/>
    ));
}

type QualityControlOutputV3Props = {
    output: QualityOutputV3;
    toolVersion: string;
    leading?: React.ReactNode;
    trailing?: React.ReactNode;
}

// A fragment, not a container: the header row and cards are laid out as direct children of the section's Stack.
export const QualityControlOutputV3 = ({output, toolVersion, leading, trailing}: QualityControlOutputV3Props) => {
    const [selected, setSelected] = useState<string>(null);
    const [onlyFailed, setOnlyFailed] = useState(false);
    const selectId = useId();

    const options = groupingOptions(output.groupings);
    const initial = output.groupings.length > 0 ? tagGrouping(output.groupings[0]) : StatusGrouping;
    const option = options.find(o => o.value === selected) ?? options.find(o => o.value === initial);

    const hasFailures = output.metrics.some(m => m.status === QualityMetricStatus.Fail);
    // Ignored rather than reset when there is nothing to filter to, so the switch reads as disabled and off.
    const showOnlyFailed = onlyFailed && hasFailures;
    const tableMetrics = showOnlyFailed ? output.metrics.filter(m => m.status === QualityMetricStatus.Fail) : output.metrics;

    const controls = output.metrics.length > 0 ? (
        <>
            <Switch size="sm" label="Only show failed" disabled={!hasFailures} checked={showOnlyFailed}
                    onChange={event => setOnlyFailed(event.currentTarget.checked)}/>
            <Group gap="xs" wrap="nowrap">
                <Text component="label" htmlFor={selectId} size="sm">Group by</Text>
                <Select id={selectId} size="xs" w={160} allowDeselect={false} data={options.map(({value, label}) => ({value, label}))}
                        value={option.value} onChange={value => value && setSelected(value)}/>
            </Group>
        </>
    ) : null;

    return (
        <>
            <QualityOutputHeader leading={leading} toolVersion={toolVersion} controls={controls} trailing={trailing}/>
            {output.error ? (
                <Card withBorder>
                    <Card.Section bg="red.4" p={8}>
                        <Text fw={500}>Service Error: {output.error.kind}</Text>
                    </Card.Section>
                    <Card.Section p={12}>
                        <Stack gap="xs">
                            <Text size="sm">{output.error.description}</Text>
                            {output.error.stage ? <Text size="xs" c="dimmed">Stage: {output.error.stage}</Text> : null}
                            {output.error.info ? <Text size="xs" c="dimmed">{output.error.info}</Text> : null}
                        </Stack>
                    </Card.Section>
                </Card>
            ) : null}
            {output.metrics.length > 0 ? (
                <>
                    <MetricSummary metrics={output.metrics} grouping={output.groupings[0]}/>
                    {metricTables(output, tableMetrics, option)}
                </>
            ) : null}
        </>
    );
}
