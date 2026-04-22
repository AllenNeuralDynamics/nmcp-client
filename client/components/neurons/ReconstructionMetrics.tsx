import * as React from "react";
import {useMemo} from "react";
import {useQuery} from "@apollo/client";
import {Accordion, Flex, Loader, SimpleGrid, Stack, Table, Text} from "@mantine/core";
import {BarChart} from "@mantine/charts";

import {
    RECONSTRUCTION_METRICS_QUERY,
    ReconstructionMetricsQueryResponse,
    ReconstructionMetricsQueryVariables,
} from "../../graphql/reconstructionMetrics";
import {DominantStructure} from "../../models/reconstructionMetrics";
import {useConstants} from "../../hooks/useConstants";
import {DataConstants} from "../../models/constants";
import {AxonStructureName, DendriteStructureName} from "../../models/neuronStructure";

type ReconstructionMetricsProps = {
    reconstructionId?: string;
}

const MAX_CHART_ENTRIES = 9;

const TOTAL_COLOR = "teal.6";
const AXON_COLOR = "blue.6";
const DENDRITE_COLOR = "red.6";

function formatNumber(value: number): string {
    return value.toLocaleString();
}

function formatLength(micrometers: number): string {
    if (micrometers >= 1000) {
        return `${(micrometers / 1000).toFixed(1)} mm`;
    }
    return `${micrometers.toFixed(1)} μm`;
}

function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
}

function resolveStructureName(constants: DataConstants, id: string): string {
    const s = constants?.AtlasConstants?.findStructure(id);
    return s?.acronym ?? s?.name ?? id;
}

function formatDominantStructures(constants: DataConstants, structures: DominantStructure[]): string {
    if (!structures || structures.length === 0) return "—";
    return structures.map(s => resolveStructureName(constants, s.atlasStructureId)).join(", ");
}

type BarEntry = Record<string, string | number>;

function makeBarData(
    entries: { atlasStructureId: string; value: number }[],
    seriesName: string,
    constants: DataConstants
): BarEntry[] {
    const sorted = entries
        .filter(e => e.value > 0)
        .sort((a, b) => b.value - a.value);

    const top = sorted.slice(0, MAX_CHART_ENTRIES).map(entry => ({
        structure: resolveStructureName(constants, entry.atlasStructureId),
        [seriesName]: Math.round(entry.value * 10) / 10,
    }));

    if (sorted.length > MAX_CHART_ENTRIES) {
        const otherValue = sorted.slice(MAX_CHART_ENTRIES).reduce((sum, e) => sum + e.value, 0);
        top.push({structure: "Other", [seriesName]: Math.round(otherValue * 10) / 10});
    }

    return top;
}

function makeNodeBarFromDetailed(
    entries: { atlasStructureId: string; neuronStructureId: string; nodeCount: number }[],
    neuronStructureId: string,
    constants: DataConstants
): BarEntry[] {
    if (!neuronStructureId) return [];
    const filtered = entries.filter(e => e.neuronStructureId === neuronStructureId);
    const total = filtered.reduce((sum, e) => sum + e.nodeCount, 0);
    if (total === 0) return [];
    return makeBarData(
        filtered.map(e => ({atlasStructureId: e.atlasStructureId, value: (e.nodeCount / total) * 100})),
        "%",
        constants
    );
}

function findNeuronStructureId(constants: DataConstants, name: string): string | null {
    return constants?.NeuronStructures?.find(ns => ns.tracingStructure?.name === name)?.TracingStructureId ?? null;
}

const BAR_HEIGHT = 300;

function renderBar(data: BarEntry[], seriesName: string, color: string) {
    if (data.length === 0) {
        return <Text size="sm" c="dimmed">No data</Text>;
    }
    return (
        <BarChart
            h={BAR_HEIGHT}
            data={data}
            dataKey="structure"
            series={[{name: seriesName, color}]}
            valueFormatter={formatPercent}
            tickLine="x"
        />
    );
}

export const ReconstructionMetrics = ({reconstructionId}: ReconstructionMetricsProps) => {
    const constants = useConstants();

    const {data, loading} = useQuery<ReconstructionMetricsQueryResponse, ReconstructionMetricsQueryVariables>(RECONSTRUCTION_METRICS_QUERY, {
        variables: {id: reconstructionId},
        skip: !reconstructionId
    });

    const metrics = data?.reconstructionMetrics;

    const totalNodeBar = useMemo(() => {
        if (!metrics) return [];
        return makeBarData(
            metrics.nodeCounts.byStructure.map(e => ({atlasStructureId: e.atlasStructureId, value: e.nodePercentage})),
            "%", constants
        );
    }, [metrics, constants]);

    const axonNodeBar = useMemo(() => {
        if (!metrics) return [];
        return makeNodeBarFromDetailed(metrics.detailedEntries, findNeuronStructureId(constants, AxonStructureName), constants);
    }, [metrics, constants]);

    const dendriteNodeBar = useMemo(() => {
        if (!metrics) return [];
        return makeNodeBarFromDetailed(metrics.detailedEntries, findNeuronStructureId(constants, DendriteStructureName), constants);
    }, [metrics, constants]);

    const totalLengthBar = useMemo(() => {
        if (!metrics) return [];
        return makeBarData(
            metrics.lengths.byStructure.map(e => ({atlasStructureId: e.atlasStructureId, value: e.totalLengthPercentage})),
            "%", constants
        );
    }, [metrics, constants]);

    const axonLengthBar = useMemo(() => {
        if (!metrics) return [];
        return makeBarData(
            metrics.lengths.byStructure.map(e => ({atlasStructureId: e.atlasStructureId, value: e.axonLengthPercentage})),
            "%", constants
        );
    }, [metrics, constants]);

    const dendriteLengthBar = useMemo(() => {
        if (!metrics) return [];
        return makeBarData(
            metrics.lengths.byStructure.map(e => ({atlasStructureId: e.atlasStructureId, value: e.dendriteLengthPercentage})),
            "%", constants
        );
    }, [metrics, constants]);

    if (loading) {
        return (
            <Flex p={24} justify="center">
                <Loader size="sm"/>
            </Flex>
        );
    }

    if (!metrics) {
        return (
            <Flex p={24}>
                <Text size="sm" c="dimmed">Metrics are not available for this reconstruction.</Text>
            </Flex>
        );
    }

    const nc = metrics.nodeCounts;
    const len = metrics.lengths;

    return (
        <Stack p={16} gap="lg">
            <Text fw={500} size="lg">Summary</Text>
            <Table withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Metric</Table.Th>
                        <Table.Th ta="right">Total</Table.Th>
                        <Table.Th ta="right">Axon</Table.Th>
                        <Table.Th ta="right">Dendrite</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td>Nodes</Table.Td>
                        <Table.Td ta="right">{formatNumber(nc.totalNodeCount)}</Table.Td>
                        <Table.Td ta="right">{formatNumber(nc.totalAxonNodeCount)}</Table.Td>
                        <Table.Td ta="right">{formatNumber(nc.totalDendriteNodeCount)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Paths</Table.Td>
                        <Table.Td ta="right">{formatNumber(nc.totalPathCount)}</Table.Td>
                        <Table.Td ta="right">{formatNumber(nc.totalAxonPathCount)}</Table.Td>
                        <Table.Td ta="right">{formatNumber(nc.totalDendritePathCount)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Branch Points</Table.Td>
                        <Table.Td ta="right">{formatNumber(nc.totalBranchCount)}</Table.Td>
                        <Table.Td ta="right">{formatNumber(nc.totalAxonBranchCount)}</Table.Td>
                        <Table.Td ta="right">{formatNumber(nc.totalDendriteBranchCount)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>End Points</Table.Td>
                        <Table.Td ta="right">{formatNumber(nc.totalEndCount)}</Table.Td>
                        <Table.Td ta="right">{formatNumber(nc.totalAxonEndCount)}</Table.Td>
                        <Table.Td ta="right">{formatNumber(nc.totalDendriteEndCount)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>Length</Table.Td>
                        <Table.Td ta="right">{formatLength(len.totalLengthMicrometer)}</Table.Td>
                        <Table.Td ta="right">{formatLength(len.totalAxonLengthMicrometer)}</Table.Td>
                        <Table.Td ta="right">{formatLength(len.totalDendriteLengthMicrometer)}</Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>

            <Text fw={500} size="lg">Dominant Structures</Text>
            <Table withColumnBorders>
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Th bg="table-header">By Node Count</Table.Th>
                        <Table.Td>{formatDominantStructures(constants, nc.dominantNodeStructures)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Th bg="table-header">By Axon Nodes</Table.Th>
                        <Table.Td>{formatDominantStructures(constants, nc.dominantAxonNodeStructures)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Th bg="table-header">By Dendrite Nodes</Table.Th>
                        <Table.Td>{formatDominantStructures(constants, nc.dominantDendriteNodeStructures)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Th bg="table-header">By Total Length</Table.Th>
                        <Table.Td>{formatDominantStructures(constants, len.dominantLengthStructures)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Th bg="table-header">By Axon Length</Table.Th>
                        <Table.Td>{formatDominantStructures(constants, len.dominantAxonLengthStructures)}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Th bg="table-header">By Dendrite Length</Table.Th>
                        <Table.Td>{formatDominantStructures(constants, len.dominantDendriteLengthStructures)}</Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>

            <Text fw={500} size="lg">Node Distribution by Atlas Structure</Text>
            <SimpleGrid cols={3}>
                <Stack gap="xs">
                    <Text size="sm" fw={500}>Total</Text>
                    {renderBar(totalNodeBar, "%", TOTAL_COLOR)}
                </Stack>
                <Stack gap="xs">
                    <Text size="sm" fw={500}>Axon</Text>
                    {renderBar(axonNodeBar, "%", AXON_COLOR)}
                </Stack>
                <Stack gap="xs">
                    <Text size="sm" fw={500}>Dendrite</Text>
                    {renderBar(dendriteNodeBar, "%", DENDRITE_COLOR)}
                </Stack>
            </SimpleGrid>

            <Text fw={500} size="lg">Length Distribution by Atlas Structure</Text>
            <SimpleGrid cols={3}>
                <Stack gap="xs">
                    <Text size="sm" fw={500}>Total</Text>
                    {renderBar(totalLengthBar, "%", TOTAL_COLOR)}
                </Stack>
                <Stack gap="xs">
                    <Text size="sm" fw={500}>Axon</Text>
                    {renderBar(axonLengthBar, "%", AXON_COLOR)}
                </Stack>
                <Stack gap="xs">
                    <Text size="sm" fw={500}>Dendrite</Text>
                    {renderBar(dendriteLengthBar, "%", DENDRITE_COLOR)}
                </Stack>
            </SimpleGrid>

            <Accordion variant="contained">
                <Accordion.Item value="detail">
                    <Accordion.Control>
                        <Text fw={500}>Per-Structure Detail</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Table withColumnBorders striped>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Structure</Table.Th>
                                    <Table.Th ta="right">Nodes</Table.Th>
                                    <Table.Th ta="right">Node %</Table.Th>
                                    <Table.Th ta="right">Paths</Table.Th>
                                    <Table.Th ta="right">Branches</Table.Th>
                                    <Table.Th ta="right">Ends</Table.Th>
                                    <Table.Th ta="right">Total Length</Table.Th>
                                    <Table.Th ta="right">Axon Length</Table.Th>
                                    <Table.Th ta="right">Dendrite Length</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {[...nc.byStructure]
                                    .sort((a, b) => b.nodeCount - a.nodeCount)
                                    .map(entry => {
                                        const lengthEntry = len.byStructure.find(l => l.atlasStructureId === entry.atlasStructureId);
                                        return (
                                            <Table.Tr key={entry.atlasStructureId}>
                                                <Table.Td>{resolveStructureName(constants, entry.atlasStructureId)}</Table.Td>
                                                <Table.Td ta="right">{formatNumber(entry.nodeCount)}</Table.Td>
                                                <Table.Td ta="right">{formatPercent(entry.nodePercentage)}</Table.Td>
                                                <Table.Td ta="right">{formatNumber(entry.pathCount)}</Table.Td>
                                                <Table.Td ta="right">{formatNumber(entry.branchCount)}</Table.Td>
                                                <Table.Td ta="right">{formatNumber(entry.endCount)}</Table.Td>
                                                <Table.Td ta="right">{lengthEntry ? formatLength(lengthEntry.totalLengthMicrometer) : "—"}</Table.Td>
                                                <Table.Td ta="right">{lengthEntry ? formatLength(lengthEntry.axonLengthMicrometer) : "—"}</Table.Td>
                                                <Table.Td ta="right">{lengthEntry ? formatLength(lengthEntry.dendriteLengthMicrometer) : "—"}</Table.Td>
                                            </Table.Tr>
                                        );
                                    })}
                            </Table.Tbody>
                        </Table>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </Stack>
    );
};
