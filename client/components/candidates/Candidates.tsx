import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {useQuery} from "@apollo/client";
import {Card, Center, Divider, Group, Loader, SimpleGrid, Space, Stack, Text} from "@mantine/core";

import {CANDIDATE_NEURONS_QUERY, CandidateNeuronsResponse, NeuronsQueryVariables} from "../../graphql/candidates";
import {NeuronShape} from "../../models/neuron";
import {CandidateFilter} from "../../viewmodel/candidateFilter";
import {PaginationHeader} from "../common/PaginationHeader";
import {CandidatesTable} from "./CandidatesTable";
import {CandidatesView} from "./CandidatesView";
import {CandidateActions} from "./CandidateActions";
import {CandidateFilters} from "./CandidateFilters";
import {CandidateMetrics} from "./CandidateMetrics";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";

function noCandidatesText(isFiltered: boolean) {
    return isFiltered ? "There are no candidates that match the current filtering options." : "There are no candidates without annotations in progress.  Enable the In Progress toggle to see any candidates that have  active annotations.";
}

export const Candidates = observer(() => {
    const [selectedCandidateId, setSelectedCandidateId] = useState<string>(null);

    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(10);
    const [candidateFilter] = useState(new CandidateFilter());

    const {data, loading, error, previousData} = useQuery<CandidateNeuronsResponse, NeuronsQueryVariables>(CANDIDATE_NEURONS_QUERY, {
        variables: {
            input: {
                offset: offset,
                limit: limit,
                specimenIds: candidateFilter.specimenIds,
                atlasStructureIds: candidateFilter.atlasStructureIds,
                keywords: candidateFilter.keywords,
                somaProperties: candidateFilter.somaFilter
            },
            includeInProgress: candidateFilter.includeInProgress
        },
        pollInterval: 60000
    });

    if (error) {
        return <GraphQLErrorAlert title="Candidate Data Could Not Be Loaded" error={error}/>;
    }

    let candidateCache: NeuronShape[];
    let totalCount: number;
    let selection: NeuronShape = null;

    if (data?.candidateNeurons) {
        candidateCache = data.candidateNeurons.items;
        totalCount = data.candidateNeurons.totalCount;
        if (selectedCandidateId) {
            selection = candidateCache.find(n => n.id == selectedCandidateId) ?? null;
            if (selection == null) {
                setSelectedCandidateId(null);
            }
        }
    } else {
        if (selectedCandidateId) {
            setSelectedCandidateId(null);
        }
        if (previousData) {
            candidateCache = previousData.candidateNeurons.items;
            totalCount = previousData.candidateNeurons.totalCount;
        } else {
            return <Center><Loader type="dots"/></Center>;
        }
    }

    const onNeuronSelectedFromViewer = (id: string) => {
        const neuron = candidateCache.find(n => n.id == id);

        if (neuron) {
            setSelectedCandidateId(neuron?.id);
        }
    }

    const pageCount = Math.max(Math.ceil(totalCount / limit), 1);
    const activePage = offset ? (Math.floor(offset / limit) + 1) : 1;
    const start = offset + 1;
    const end = Math.min(offset + limit, totalCount);

    return (
        <Stack m={16}>
            <Card withBorder>
                <Card.Section bg="segment">
                    <Group p={12}>
                        <Text size="lg" fw={500}>Candidate Neurons</Text>
                    </Group>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section bg="segment">
                    <CandidateFilters candidateFilter={candidateFilter}/>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section bg="segment">
                    <CandidateMetrics candidateFilter={candidateFilter}/>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section>
                    <PaginationHeader total={pageCount} value={activePage} limit={limit} itemCount={totalCount}
                                      onLimitChange={(limit) => setLimit(limit)} onChange={(page) => setOffset((page - 1) * limit)}/>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                {candidateCache.length > 0 ?
                    <Card.Section bg="segment">
                        <CandidateActions neuron={selection} showAnnotators={candidateFilter.includeInProgress}/>
                        <Divider orientation="horizontal"/>
                    </Card.Section> : null}
                <Card.Section>
                    {candidateCache.length > 0 ?
                        <CandidatesTable neurons={candidateCache} showAnnotators={candidateFilter.includeInProgress}
                                         selectedCandidate={selection}
                                         activePage={activePage} offset={offset} limit={limit} totalCount={totalCount} pageCount={pageCount}
                                         onSelected={(n => setSelectedCandidateId(n.id == selectedCandidateId ? null : n.id))}/>
                        : (loading ? null : <Center p={24}><Text c="dimmed">{noCandidatesText(candidateFilter.anyEnabled)}</Text></Center>)}
                    <Divider orientation="horizontal"/>
                </Card.Section>
                {candidateCache.length > 0 ?
                    <Card.Section bg="segment">
                        <SimpleGrid cols={2} p={8}>
                            <Text size="sm">
                                {`Showing ${start} to ${end} of ${totalCount} candidate neurons`}
                            </Text>
                            <Text size="sm" ta="end">{`Page ${activePage} of ${pageCount}`}</Text>
                        </SimpleGrid>
                        <Divider orientation="horizontal"/>
                    </Card.Section> : null}
                <Card.Section>
                    <CandidatesView neurons={candidateCache} selected={selection} onViewerSelected={onNeuronSelectedFromViewer}/>
                </Card.Section>
            </Card>
            <Space h={16}/>
        </Stack>
    );
});
