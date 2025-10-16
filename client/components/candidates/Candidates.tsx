import * as React from "react";
import {useRef, useState} from "react";
import {observer} from "mobx-react";
import {useQuery} from "@apollo/client";
import {Checkbox, Header, Icon, List, Message, Segment} from "semantic-ui-react";
import {Title, Select, NumberInput, Group as MGroup} from "@mantine/core";

import {useCandidateFilter} from "../../hooks/useCandidateFilter";
import {CANDIDATE_NEURONS_QUERY, CandidateNeuronsResponse, NeuronsQueryVariables} from "../../graphql/candidates";
import {INeuron, SomaProperties} from "../../models/neuron";
import {CandidateFilter} from "../../viewmodel/candidateFilter";
import {PaginationHeader} from "../common/PaginationHeader";
import {CandidateTracingsTable} from "./CandidatesTable";
import {CandidatesViewer} from "./CandidateViewer";
import {CandidateActionPanel} from "./CandidateActionPanel";
import {CandidateFilterPanel} from "./CandidateFilterPanel";

function somaPropertyInputFromFilter(filter: CandidateFilter): SomaProperties {
    const input: any = {};

    if (filter.limitBrightness) {
        input.brightnessOperator = parseInt(filter.brightnessOperator);
        input.brightness = filter.brightness;
    }

    if (filter.limitVolume) {
        input.volumeOperator = parseInt(filter.volumeOperator);
        input.volume = filter.volume;
    }

    return input;
}

export const Candidates = observer(() => {
    const [state, setState] = useState({
        selectedCandidate: null
    });

    const candidateCache = useRef<INeuron[]>([]);

    const totalCount = useRef<number>(0);

    const candidateFilter = useCandidateFilter();

    const sampleFilter = candidateFilter.limitSamples ? candidateFilter.sampleFilter : []

    const brainAreaFilter = candidateFilter.limitBrainAreas ? candidateFilter.brainAreaFilter.map(b => b.id) : []

    const {error, data} = useQuery<CandidateNeuronsResponse, NeuronsQueryVariables>(CANDIDATE_NEURONS_QUERY, {
        variables: {
            input: {
                offset: candidateFilter.offset,
                limit: candidateFilter.limit,
                sampleIds: sampleFilter,
                brainStructureIds: brainAreaFilter,
                tag: candidateFilter.limitTags ? candidateFilter.tagFilter : "",
                somaProperties: somaPropertyInputFromFilter(candidateFilter),
            },
            includeInProgress: candidateFilter.includeInProgress
        },
        pollInterval: 60000
    });

    if (error) {
        return <Message negative style={{margin: "20px"}}>
            <Icon name="circle notched" loading/>
            <Message.Content>
                <Message.Header content="Error"/>s
                {error.graphQLErrors.map(({message}, i) => (
                    <span key={i}>{message}</span>))}
            </Message.Content>
        </Message>
    }

    if (data && data?.candidateNeurons) {
        candidateCache.current = data.candidateNeurons.items;
        totalCount.current = data.candidateNeurons.totalCount;
    }

    const onUpdateOffset = (page: number) => {
        candidateFilter.offset = candidateFilter.limit * (page - 1);
    };

    const onUpdateLimit = (limit: number) => {
        if (limit !== candidateFilter.limit) {
            if (candidateFilter.offset < limit) {
                candidateFilter.offset = 0;
            }

            candidateFilter.limit = limit;
        }
    };

    const onNeuronSelectedFromViewer = (id: string) => {
        const neuron = candidateCache.current.find(n => n.id == id);

        if (neuron) {
            setState({...state, selectedCandidate: neuron});
        }
    }

    const pageCount = Math.max(Math.ceil(totalCount.current / candidateFilter.limit), 1);

    const activePage = candidateFilter.offset ? (Math.floor(candidateFilter.offset / candidateFilter.limit) + 1) : 1;

    return (
        <div style={{margin: "20px"}}>
            <Segment.Group>
                <Segment secondary>
                    <div style={{display: "flex"}}>
                        <Header style={{margin: "0", flexGrow: 1}}>Candidate Neurons</Header>
                        {/*reportWithPopup*/}
                    </div>
                </Segment>
                <CandidateFilterPanel candidateFilter={candidateFilter}/>
                <Segment secondary>
                    <Title order={4}>Use Metrics</Title>
                    <List horizontal divided>
                        <List.Item>
                            <MGroup>
                                <Checkbox style={{verticalAlign: "middle"}} toggle label="Brightness"
                                          checked={candidateFilter.limitBrightness}
                                          onChange={(_, data) => {
                                              candidateFilter.limitBrightness = data.checked;
                                              candidateFilter.offset = 0;
                                          }}/>
                                <Select style={{maxWidth: "80px"}} disabled={!candidateFilter.limitBrightness} withCheckIcon={false}
                                        data={[{value: "2", label: "≤"}, {value: "3", label: "≥"}]}
                                        value={candidateFilter.brightnessOperator}
                                        onChange={(value) => {
                                            if (value) {
                                                candidateFilter.brightnessOperator = value;
                                                candidateFilter.offset = 0;
                                            }
                                        }}/>
                                <NumberInput style={{maxWidth: "80px"}} disabled={!candidateFilter.limitBrightness} min={0} hideControls
                                             value={candidateFilter.brightness} onChange={(value) => {
                                    candidateFilter.setBrightness(value);
                                    candidateFilter.offset = 0;
                                }}/>
                            </MGroup>
                        </List.Item>
                        <List.Item>
                            <MGroup>
                                <Checkbox style={{verticalAlign: "middle"}} toggle label="Volume"
                                          checked={candidateFilter.limitVolume}
                                          onChange={(_, data) => {
                                              candidateFilter.limitVolume = data.checked;
                                              candidateFilter.offset = 0;
                                          }}/>
                                <Select style={{maxWidth: "80px"}} disabled={!candidateFilter.limitVolume} withCheckIcon={false}
                                        data={[{value: "2", label: "≤"}, {value: "3", label: "≥"}]}
                                        value={candidateFilter.volumeOperator}
                                        onChange={(value) => {
                                            if (value) {
                                                candidateFilter.volumeOperator = value;
                                                candidateFilter.offset = 0;
                                            }
                                        }}/>
                                <NumberInput style={{maxWidth: "80px"}} disabled={!candidateFilter.limitVolume} min={0} hideControls
                                             value={candidateFilter.volume} onChange={(value) => {
                                    candidateFilter.setVolume(value);
                                    candidateFilter.offset = 0;
                                }}/>
                            </MGroup>
                        </List.Item>
                    </List>
                </Segment>
                <Segment>
                    <PaginationHeader pageCount={pageCount} activePage={activePage} limit={candidateFilter.limit}
                                      onUpdateLimitForPage={onUpdateLimit} onUpdateOffsetForPage={onUpdateOffset}/>
                </Segment>
                <Segment secondary>
                    <CandidateActionPanel neurons={candidateCache.current} neuronId={state.selectedCandidate?.id}/>
                </Segment>
                <CandidateTracingsTable neurons={candidateCache.current}
                                        showAnnotators={candidateFilter.includeInProgress}
                                        activePage={activePage} offset={candidateFilter.offset} limit={candidateFilter.limit}
                                        totalCount={totalCount.current} pageCount={pageCount}
                                        onSelected={(n => setState({
                                            ...state,
                                            selectedCandidate: n == state.selectedCandidate ? null : n
                                        }))}
                                        selectedCandidate={state.selectedCandidate}/>

            </Segment.Group>

            <CandidatesViewer neurons={candidateCache.current} selectedId={state.selectedCandidate?.id} onViewerSelected={onNeuronSelectedFromViewer}/>
        </div>
    );
});
