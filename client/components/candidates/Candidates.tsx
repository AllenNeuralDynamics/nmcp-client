import * as React from "react";
import {useEffect, useMemo, useRef, useState} from "react";
import {useApolloClient} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {ActionIcon, Box, Card, Center, Collapse, Divider, Group, Loader, Slider, Stack, Text, Tooltip} from "@mantine/core";
import {IconChevronDown, IconChevronUp, IconRefresh} from "@tabler/icons-react";

import {CandidateFilter, CandidateFilterWatch, watchQueryVariables} from "../../viewmodel/candidateFilter";
import {CandidateTableViewModel} from "../../viewmodel/candidateTableViewModel";
import {CandidateLocationLoader} from "../../viewmodel/candidateLocationLoader";
import {CandidatesTable, CandidatesTableHandle} from "./CandidatesTable";
import {CandidatesView} from "./CandidatesView";
import {CandidateActions} from "./CandidateActions";
import {CandidateFilters} from "./CandidateFilters";
import {CandidateMetrics} from "./CandidateMetrics";
import {usePendingTableScroll} from "./usePendingTableScroll";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";
import {useAppLayout} from "../../hooks/useAppLayout";
import {useConstants} from "../../hooks/useConstants";
import {AtlasViewModel} from "../../viewmodel/atlasViewModel";

const MinRowCountForSlider = 10;

const rowCountMarks = [10, 20, 30, 40, 50].map(value => ({value, label: `${value}`}));

function noCandidatesText(isFiltered: boolean) {
    return isFiltered ? "There are no candidates that match the current filtering options." : "There are no candidates without annotations in progress.  Use Include to see candidates with annotations that are in progress, duplicate, incomplete or untraceable.";
}

export const Candidates = observer(() => {
    const client = useApolloClient();
    const constants = useConstants();
    const appLayout = useAppLayout();

    const pinned = appLayout.isCandidateViewerPinned;
    const [filtersExpanded, setFiltersExpanded] = useState(true);
    const [tableExpanded, setTableExpanded] = useState(true);

    const [candidateFilter] = useState(() => new CandidateFilter(constants.DefaultAtlas?.id ?? null));
    const [tableViewModel] = useState(() => new CandidateTableViewModel(client));
    const [locationLoader] = useState(() => new CandidateLocationLoader(client));

    const tableRef = useRef<CandidatesTableHandle>(null);
    const filterWatchRef = useRef<CandidateFilterWatch>(null);

    const [visibleRowCount, setVisibleRowCount] = useState(10);
    const [sliderValue, setSliderValue] = useState(10);
    const [visibleRange, setVisibleRange] = useState<[number, number]>([0, 9]);

    const atlasViewModel = useMemo(() => {
        const atlas = constants.getAtlas(candidateFilter.atlasId);

        return atlas ? new AtlasViewModel(atlas) : null;
    }, [constants, candidateFilter.atlasId]);

    useEffect(() => {
        const watch = watchQueryVariables(candidateFilter, (variables, filterChanged) => {
            if (filterChanged) {
                tableRef.current?.scrollToTop();
            }

            tableViewModel.reset(variables, filterChanged);

            void locationLoader.start(variables);
        });

        filterWatchRef.current = watch;

        watch.refresh();

        return () => {
            watch.dispose();
            tableViewModel.dispose();
            locationLoader.cancel();
        }
    }, []);

    const {totalCount, loadError, selectedId, selectedNeuron, version} = tableViewModel;

    const tableReady = !loadError && (totalCount ?? 0) > 0;

    const requestScroll = usePendingTableScroll(tableRef, tableReady, totalCount, selectedId);

    // Every reset goes through the watcher, which must cancel a pending filter settle, or a refresh inside the
    // debounce window would reset both views twice.
    const refresh = () => filterWatchRef.current?.refresh();

    const onViewerSelected = async (id: string) => {
        if (id === tableViewModel.selectedId) {
            return;
        }

        const offset = await tableViewModel.selectFromViewer(id);

        if (offset !== null) {
            requestScroll(id, offset);
        }
    };

    const onReconstructionStarted = async (id: string) => {
        if (await tableViewModel.handleReconstructionStarted(id, candidateFilter.includeInProgress)) {
            locationLoader.remove(id);
        }
    };

    let tableContent: React.ReactNode;

    if (loadError) {
        tableContent = <GraphQLErrorAlert title="Candidate Data Could Not Be Loaded" error={loadError}/>;
    } else if (totalCount === null) {
        tableContent = <Center p={24}><Loader type="dots"/></Center>;
    } else if (totalCount === 0) {
        tableContent = <Center p={24}><Text c="dimmed">{noCandidatesText(candidateFilter.anyEnabled)}</Text></Center>;
    } else {
        tableContent = <CandidatesTable ref={tableRef} totalCount={totalCount} visibleRowCount={visibleRowCount}
                                        rowAt={offset => tableViewModel.rowAt(offset)} version={version}
                                        showAnnotators={candidateFilter.includeInProgress} selectedId={selectedId}
                                        onSelected={neuron => tableViewModel.selectRow(neuron)}
                                        onRangeChange={(first, last) => {
                                            setVisibleRange([first, last]);
                                            tableViewModel.showRange(first, last);
                                        }}/>;
    }

    return (
        // Pinning changes only styles, never the element tree, so toggling it cannot remount the Neuroglancer viewer.
        // Free space goes to the viewer. When pinned and short of space only the table area shrinks and scrolls, because
        // the viewer section cannot shrink below its content, which holds the viewer at its minimum height.
        <Stack m={16} style={{flexGrow: 1, minHeight: pinned ? 0 : undefined}}>
            <Card withBorder padding={0} style={{flexGrow: 1, minHeight: pinned ? 0 : undefined}}>
                <Box style={pinned ? {minHeight: 0, overflowY: "auto"} : undefined}>
                    <Card.Section bg="segment">
                        <Group p={12} justify="space-between">
                            <Text size="lg" fw={500}>Candidate Neurons</Text>
                            <Group gap={4}>
                                <Tooltip label="Reload the candidates and soma locations">
                                    <ActionIcon variant="subtle" aria-label="Refresh candidates" onClick={refresh}>
                                        <IconRefresh size={18}/>
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label={filtersExpanded ? "Hide the filters" : "Show the filters"}>
                                    <ActionIcon variant="subtle" aria-label={filtersExpanded ? "Hide filters" : "Show filters"}
                                                aria-expanded={filtersExpanded} onClick={() => setFiltersExpanded(!filtersExpanded)}>
                                        {filtersExpanded ? <IconChevronUp size={18}/> : <IconChevronDown size={18}/>}
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Group>
                        <Divider orientation="horizontal"/>
                    </Card.Section>
                    <Collapse in={filtersExpanded}>
                        <Card.Section bg="segment">
                            <CandidateFilters candidateFilter={candidateFilter}/>
                            <Divider orientation="horizontal"/>
                        </Card.Section>
                        <Card.Section bg="segment">
                            <CandidateMetrics candidateFilter={candidateFilter}/>
                            <Divider orientation="horizontal"/>
                        </Card.Section>
                        {!loadError && totalCount >= MinRowCountForSlider ?
                            <Card.Section>
                                <Group p={12} align="center">
                                    <Slider miw={300} mb={14} min={10} max={50} step={5} value={sliderValue} marks={rowCountMarks}
                                            onChange={setSliderValue} onChangeEnd={setVisibleRowCount}/>
                                </Group>
                                <Divider orientation="horizontal"/>
                            </Card.Section> : null}
                    </Collapse>
                    {tableReady ?
                        <Card.Section bg="segment">
                            <Group gap={0} wrap="nowrap" pr={12}>
                                <Box style={{flexGrow: 1, minWidth: 0}}>
                                    {selectedId && !selectedNeuron ?
                                        <Center p={16}><Loader size="sm" type="dots"/></Center> :
                                        <CandidateActions neuron={selectedNeuron} showAnnotators={candidateFilter.includeInProgress}
                                                          onReconstructionStarted={onReconstructionStarted}/>}
                                </Box>
                                <Tooltip label={tableExpanded ? "Hide the table" : "Show the table"}>
                                    <ActionIcon variant="subtle" aria-label={tableExpanded ? "Hide table" : "Show table"}
                                                aria-expanded={tableExpanded} onClick={() => setTableExpanded(!tableExpanded)}>
                                        {tableExpanded ? <IconChevronUp size={18}/> : <IconChevronDown size={18}/>}
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                            <Divider orientation="horizontal"/>
                        </Card.Section> : null}
                    {/* keepMounted hides with height rather than display: none, which would reset the table's scroll position. The
                        toggle only exists while the table is ready, so loading, error and empty messages always show. */}
                    <Collapse in={tableExpanded || !tableReady} keepMounted>
                        <Card.Section>
                            {tableContent}
                            <Divider orientation="horizontal"/>
                        </Card.Section>
                        {tableReady ?
                            <Card.Section bg="segment">
                                <Text size="sm" p={8}>
                                    {`Showing ${visibleRange[0] + 1} to ${visibleRange[1] + 1} of ${totalCount} candidate neurons`}
                                </Text>
                                <Divider orientation="horizontal"/>
                            </Card.Section> : null}
                    </Collapse>
                </Box>
                <Card.Section style={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
                    <CandidatesView atlasViewModel={atlasViewModel} locationLoader={locationLoader} selectedId={selectedId}
                                    selectedNeuron={selectedNeuron} onViewerSelected={onViewerSelected}/>
                </Card.Section>
            </Card>
        </Stack>
    );
});
