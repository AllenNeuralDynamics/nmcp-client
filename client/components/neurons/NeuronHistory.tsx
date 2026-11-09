import React, {useMemo, useState} from "react";
import {useQuery} from "@apollo/client";
import {Badge, Checkbox, Group, Select, SimpleGrid, Stack, Text, Timeline, Tooltip} from "@mantine/core";
import dayjs from "dayjs";

import {
    NEURON_VERSION_HISTORY_QUERY,
    NeuronVersionHistoryResponse,
    NeuronVersionHistoryVariables,
    VersionHistoryBranch,
    VersionHistoryEvent
} from "../../graphql/neuron";
import {AnnotationStatus, statusColor, statusNameOnly} from "../../models/annotationStatus";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";
import {AppLoading} from "../app/AppLoading";
import {SettingsChange} from "../../util/pageSettings";
import {NeuronHistorySettings} from "./neuronSettings";

const objectPrefixes: [string, string][] = [
    ["AtlasReconstruction", "Atlas Reconstruction"],
    ["SpecimenSpaceReconstruction", "Specimen Space Reconstruction"],
    ["SpecimenPrecomputed", "Specimen Precomputed"],
    ["AtlasQualityControl", "Quality Control"],
    // Event rows written before nmcp-api renamed the kinds still store the old QualityControl* names.
    ["QualityControl", "Quality Control"],
    ["Annotation", "Reconstruction"],
    ["Reconstruction", "Reconstruction"],
    ["Precomputed", "Precomputed"],
    ["Candidates", "Candidates"],
    ["Specimen", "Specimen"],
    ["Neuron", "Neuron"],
];

const pastTenseMap: Record<string, string> = {
    "Create": "Created",
    "Update": "Updated",
    "Delete": "Deleted",
    "Upload": "Uploaded",
    "Pause": "Paused",
    "Resume": "Resumed",
    "Request": "Requested",
    "Approve": "Approved",
    "Reject": "Rejected",
    "Discard": "Discarded",
    "Archive": "Archived",
    "Complete": "Completed",
    "Assign": "Assigned",
    "Finalize": "Finalized",
    "Publish": "Published",
    "Insert": "Inserted",
};

const systemInternalName = "System Internal";

export function formatEventName(name: string): string {
    let prefix = "";
    let action = name;

    for (const [key, label] of objectPrefixes) {
        if (name.startsWith(key)) {
            prefix = label;
            action = name.slice(key.length);
            break;
        }
    }

    if (!action) {
        return prefix;
    }

    const words = action.replace(/([A-Z])/g, " $1").trim().split(" ");

    const lastWord = words[words.length - 1];
    if (pastTenseMap[lastWord]) {
        words[words.length - 1] = pastTenseMap[lastWord];
    } else if (words.length > 1 && pastTenseMap[words[0]]) {
        words[0] = pastTenseMap[words[0]];
    }

    const actionStr = words.join(" ");
    return prefix ? `${prefix}: ${actionStr}` : actionStr;
}

function isSystemEvent(event: VersionHistoryEvent): boolean {
    if (!event.user) {
        return false;
    }
    return `${event.user.firstName} ${event.user.lastName}` === systemInternalName;
}

function branchLabel(branch: VersionHistoryBranch): string {
    const shortId = branch.annotationId.slice(-6);
    const status = statusNameOnly(branch.status as AnnotationStatus);
    return `Reconstruction ${shortId} (${status})`;
}

function branchSortOrder(branch: VersionHistoryBranch): number {
    if (branch.status === AnnotationStatus.Published) return 0;
    if (branch.status === AnnotationStatus.Archived) return 2;
    return 1;
}

function selectDefaultBranch(branches: VersionHistoryBranch[]): number {
    const publishedIndex = branches.findIndex(b => b.status === AnnotationStatus.Published);
    if (publishedIndex >= 0) {
        return publishedIndex;
    }

    let bestIndex = 0;
    let bestDate = "";

    for (let i = 0; i < branches.length; i++) {
        if (branches[i].status === AnnotationStatus.Archived) {
            continue;
        }
        const events = branches[i].events;
        if (events.length > 0) {
            const lastDate = events[events.length - 1].createdAt;
            if (lastDate > bestDate) {
                bestDate = lastDate;
                bestIndex = i;
            }
        }
    }

    return bestIndex;
}

function filterEvents(events: VersionHistoryEvent[], showSystem: boolean): VersionHistoryEvent[] {
    if (showSystem) {
        return events;
    }
    return events.filter(e => !isSystemEvent(e));
}

function isFilteredKey(key: string): boolean {
    return key === "id" || key.endsWith("Id") || key.endsWith("At");
}

function isSystemKey(key: string): boolean {
    return key === "status" || key.endsWith("Status");
}

function formatLabel(key: string): string {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()).trim();
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "none";
    }
    if (Array.isArray(value)) {
        return value.join(", ");
    }
    if (typeof value === "object") {
        return Object.entries(value)
            .filter(([k]) => !isFilteredKey(k))
            .map(([k, v]) => `${formatLabel(k)}: ${formatValue(v)}`)
            .join(", ");
    }
    if (typeof value === "boolean") {
        return value ? "yes" : "no";
    }
    return String(value);
}

type DetailEntry = { key: string; label: string; value: string };

function parseDetails(details: string, showSystemEvents: boolean): DetailEntry[] | string {
    if (!details) {
        return [];
    }

    try {
        const parsed = JSON.parse(details);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
            return String(parsed);
        }
        const entries = Object.entries(parsed)
            .filter(([key]) => !isFilteredKey(key))
            .filter(([key]) => showSystemEvents || !isSystemKey(key))
            .map(([key, value]) => ({key, label: formatLabel(key), value: formatValue(value)}));
        return entries.length > 0 ? entries : [];
    } catch {
        return details;
    }
}

function EventDetails({event, showDetails, showSystemEvents}: { event: VersionHistoryEvent; showDetails: boolean; showSystemEvents: boolean }) {
    const date = dayjs(event.createdAt).format("YYYY-MM-DD h:mm A");
    const userName = event.user ? `${event.user.firstName} ${event.user.lastName}` : null;

    let detailsContent: React.ReactNode = null;

    if (showDetails && event.details) {
        const parsed = parseDetails(event.details, showSystemEvents);
        if (typeof parsed === "string") {
            detailsContent = <Text size="xs">{parsed}</Text>;
        } else if (parsed.length > 0) {
            detailsContent = (
                <Stack gap={2}>
                    {parsed.map(entry => (
                        <Text key={entry.key} size="xs">
                            <Text span size="xs" fw={500}>{entry.label}:</Text> {entry.value}
                        </Text>
                    ))}
                </Stack>
            );
        }
    }

    return (
        <>
            {detailsContent}
            <Text size="xs" c="dimmed">
                {date}
                {userName && (
                    <>
                        {" by "}
                        {event.user.affiliation
                            ? <Tooltip label={event.user.affiliation}><Text span size="xs" c="dimmed" td="underline" style={{cursor: "default"}}>{userName}</Text></Tooltip>
                            : userName
                        }
                    </>
                )}
            </Text>
        </>
    );
}

type NeuronHistoryProps = {
    neuronId: string;
    settings: NeuronHistorySettings;

    onSettingsChange: SettingsChange<NeuronHistorySettings>;
}

export const NeuronHistory = ({neuronId, settings, onSettingsChange}: NeuronHistoryProps) => {
    const {error, data, loading} = useQuery<NeuronVersionHistoryResponse, NeuronVersionHistoryVariables>(
        NEURON_VERSION_HISTORY_QUERY, {variables: {neuronId}}
    );

    const defaultIndex = useMemo(() => {
        if (!data?.neuronVersionHistory?.branches?.length) {
            return 0;
        }
        return selectDefaultBranch(data.neuronVersionHistory.branches);
    }, [data?.neuronVersionHistory?.branches]);

    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const {showSystemEvents, showDetails} = settings;

    const setShowSystemEvents = (showSystemEvents: boolean) => onSettingsChange(s => ({...s, showSystemEvents}));

    const setShowDetails = (showDetails: boolean) => onSettingsChange(s => ({...s, showDetails}));

    if (error) {
        return <GraphQLErrorAlert title="History Could not be Loaded" error={error}/>;
    }

    if (loading || !data?.neuronVersionHistory) {
        return <AppLoading message="Loading History..."/>;
    }

    const {specimen, trunk, branches} = data.neuronVersionHistory;
    const hasMultiple = branches.length > 1;

    const activeIndex = selectedValue != null
        ? branches.findIndex(b => b.annotationId === selectedValue)
        : defaultIndex;
    const activeBranch = branches[activeIndex >= 0 ? activeIndex : 0];

    const selectData = hasMultiple
        ? branches
            .map(branch => ({
                value: branch.annotationId,
                label: branchLabel(branch),
                _sort: branchSortOrder(branch)
            }))
            .sort((a, b) => a._sort - b._sort)
            .map(({value, label}) => ({value, label}))
        : [];

    const filteredTrunk = filterEvents(trunk, showSystemEvents);
    const filteredBranchEvents = activeBranch ? filterEvents(activeBranch.events, showSystemEvents) : [];
    const filteredSpecimen = filterEvents(specimen, showSystemEvents);

    return (
        <Stack m={16} gap="md">
            <Group justify="flex-end">
                <Checkbox
                    label="Show details"
                    checked={showDetails}
                    onChange={(e) => setShowDetails(e.currentTarget.checked)}
                />
                <Checkbox
                    label="Show system events"
                    checked={showSystemEvents}
                    onChange={(e) => setShowSystemEvents(e.currentTarget.checked)}
                />
            </Group>
            <SimpleGrid cols={3}>
                <Stack gap="md">
                    <Text fw={500}>Neuron</Text>
                    {filteredTrunk.length > 0 ? (
                        <Timeline active={filteredTrunk.length - 1} bulletSize={20} lineWidth={2}>
                            {filteredTrunk.map(event => (
                                <Timeline.Item key={event.id} title={formatEventName(event.name)}>
                                    <EventDetails event={event} showDetails={showDetails} showSystemEvents={showSystemEvents}/>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    ) : (
                        <Text size="sm" c="dimmed">No events recorded</Text>
                    )}
                </Stack>

                <Stack gap="md">
                    <Text fw={500}>Reconstructions</Text>
                    {activeBranch ? (
                        <>
                            <Group>
                                {hasMultiple ? (
                                    <Select
                                        data={selectData}
                                        value={activeBranch.annotationId}
                                        onChange={setSelectedValue}
                                        allowDeselect={false}
                                        w={280}
                                    />
                                ) : (
                                    <Text fw={500}>Reconstruction</Text>
                                )}
                                <Badge variant="light" color={statusColor(activeBranch.status as AnnotationStatus)}>
                                    {statusNameOnly(activeBranch.status as AnnotationStatus)}
                                </Badge>
                            </Group>
                            {filteredBranchEvents.length > 0 ? (
                                <Timeline active={filteredBranchEvents.length - 1} bulletSize={20} lineWidth={2}>
                                    {filteredBranchEvents.map(event => (
                                        <Timeline.Item key={event.id} title={formatEventName(event.name)}>
                                            <EventDetails event={event} showDetails={showDetails} showSystemEvents={showSystemEvents}/>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            ) : (
                                <Text size="sm" c="dimmed">No events recorded</Text>
                            )}
                        </>
                    ) : (
                        <Text size="sm" c="dimmed">No reconstructions</Text>
                    )}
                </Stack>

                <Stack gap="md">
                    <Text fw={500}>Specimen</Text>
                    {filteredSpecimen.length > 0 ? (
                        <Timeline active={filteredSpecimen.length - 1} bulletSize={20} lineWidth={2}>
                            {filteredSpecimen.map(event => (
                                <Timeline.Item key={event.id} title={formatEventName(event.name)}>
                                    <EventDetails event={event} showDetails={showDetails} showSystemEvents={showSystemEvents}/>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    ) : (
                        <Text size="sm" c="dimmed">No events recorded</Text>
                    )}
                </Stack>
            </SimpleGrid>
        </Stack>
    );
}
