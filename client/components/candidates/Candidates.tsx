import * as React from "react";
import {useContext, useState} from "react";
import {useQuery} from "@apollo/client";
import {
    Checkbox,
    Dropdown,
    Header,
    Icon,
    List,
    Message,
    Segment
} from "semantic-ui-react";
import {Title, Select, NumberInput, Group as MGroup} from "@mantine/core";

import {CANDIDATE_NEURONS_QUERY, CandidateNeuronsResponse, NeuronsQueryVariables} from "../../graphql/candidates";
import {PaginationHeader} from "../common/PaginationHeader";
import {CandidateTracingsTable} from "./CandidatesTable";
import {CandidatesViewer} from "./CandidateViewer";
import {IBrainArea} from "../../models/brainArea";
import {ConstantsContext} from "../app/AppConstants";
import {CandidateActionPanel} from "./CandidateActionPanel";
import {SAMPLES_QUERY, SamplesQueryResponse} from "../../graphql/sample";
import {NeuronTagFilter} from "../common/NeuronTagFilter";
import {SomaProperties} from "../../models/neuron";
import {AtlasStructureMultiselect} from "../common/AtlasStructureMultiselect";
import {BrainAreaMultiSelect} from "../common/BrainAreaMultiSelect";

function defaultSomaPropertyFilter() {
    return {
        limitBrightness: false,
        brightnessOperator: "3",
        brightness: 0,
        limitVolume: false,
        volumeOperator: "3",
        volume: 0
    };
}

function somaPropertyInputFromFilter(filter: any): SomaProperties {
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

export const Candidates = () => {
    const [state, setState] = useState({
        offset: 0,
        limit: 10,
        includeInProgress: false,
        limitSamples: false,
        sampleFilter: [],
        limitBrainAreas: false,
        brainAreaFilter: [],
        limitTags: false,
        tagFilter: "",
        tempTagFilter: "",
        selectedCandidate: null
    });

    const [somaPropertiesState, setSomaPropertiesState] = useState(defaultSomaPropertyFilter());

    const constants = useContext(ConstantsContext);

    const sampleFilter = state.limitSamples ? state.sampleFilter : []

    const brainAreaFilter = state.limitBrainAreas ? state.brainAreaFilter.map(b => b.id) : []

    const {loading, error, data} = useQuery<CandidateNeuronsResponse, NeuronsQueryVariables>(CANDIDATE_NEURONS_QUERY, {
        variables: {
            input: {
                offset: state.offset,
                limit: state.limit,
                sampleIds: sampleFilter,
                brainStructureIds: brainAreaFilter,
                tag: state.limitTags ? state.tagFilter : "",
                somaProperties: somaPropertyInputFromFilter(somaPropertiesState),
            },
            includeInProgress: state.includeInProgress
        },
        pollInterval: 10000
    });

    const {
        loading: sampleLoading,
        error: sampleError,
        data: sampleData
    } = useQuery<SamplesQueryResponse>(SAMPLES_QUERY, {pollInterval: 5000});

    if (error || sampleError) {
        return <Message negative style={{margin: "20px"}}>
            <Icon name="circle notched" loading/>
            <Message.Content>
                <Message.Header content="Error"/>s
                {error.graphQLErrors.map(({message}, i) => (
                    <span key={i}>{message}</span>))}
            </Message.Content>
        </Message>
    }


    if (loading || sampleLoading || !data || !data.candidateNeurons) {
        return <Message icon>
            <Icon name="circle notched" loading/>
            <Message.Content>
                <Message.Header content="Updating candidate neurons"/>
                Updating candidate neurons.
            </Message.Content>
        </Message>
    }

    let samples = sampleData.samples.items;

    const sampleFilterOptions = samples.slice().sort((s1, s2) => s1.animalId < s2.animalId ? -1 : 1).map(s => {
        return {key: s.id, text: s.animalId, value: s.id}
    });

    const onUpdateOffset = (page: number) => {
        const offset = state.limit * (page - 1);

        if (offset !== state.offset) {
            setState({...state, offset});
        }
    };

    const onUpdateLimit = (limit: number) => {
        if (limit !== state.limit) {
            let offset = state.offset;

            if (offset < limit) {
                offset = 0;
            }

            setState({...state, offset, limit});
        }
    };

    const onSampleFilterChange = (data: any) => {
        setState({...state, sampleFilter: data, offset: 0});
    }

    const onBrainAreaFilterChange = (data: IBrainArea[]) => {
        setState({...state, brainAreaFilter: data, offset: 0});
    }

    const onNeuronSelectedFromViewer = (id: string) => {
        if (data && data.candidateNeurons) {
            const neuron = data.candidateNeurons.items.find(n => n.id == id);

            if (neuron) {
                setState({...state, selectedCandidate: neuron});
            }
        }
    }

    const totalCount = data.candidateNeurons.totalCount;

    const pageCount = Math.max(Math.ceil(totalCount / state.limit), 1);

    const activePage = state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1;

    return (
        <div style={{margin: "20px"}}>
            <Segment.Group>
                <Segment secondary>
                    <div style={{display: "flex"}}>
                        <Header style={{margin: "0", flexGrow: 1}}>Candidate Neurons</Header>
                        {/*reportWithPopup*/}
                    </div>
                </Segment>
                <Segment secondary>
                    <List horizontal divided>
                        <List.Item>
                            <Checkbox style={{verticalAlign: "middle"}} toggle label="Include in progress"
                                      checked={state.includeInProgress}
                                      onChange={(_, data) => setState({...state, includeInProgress: data.checked, offset: 0})}/>
                        </List.Item>
                        <List.Item>
                            <Checkbox style={{verticalAlign: "middle"}} toggle label="Limit samples "
                                      checked={state.limitSamples}
                                      onChange={(_, data) => setState({...state, limitSamples: data.checked, offset: 0})}/>

                            <Dropdown placeholder="Select..." style={{marginLeft: "8px"}} multiple selection
                                      options={sampleFilterOptions}
                                      value={state.sampleFilter}
                                      disabled={!state.limitSamples}
                                      onChange={(_, d) => onSampleFilterChange(d.value)}/>
                        </List.Item>
                        <List.Item>
                            <div style={{display: "flex", alignItems: "center"}}>
                                <Checkbox toggle label="Limit structures " checked={state.limitBrainAreas}
                                          onChange={(_, data) => setState({...state, limitBrainAreas: data.checked, offset: 0})}/>

                                <div style={{marginLeft: "8px", minWidth: "200px"}}>
                                    <BrainAreaMultiSelect selection={state.brainAreaFilter} disabled={!state.limitBrainAreas}
                                                          onSelectionChange={(brainAreas: IBrainArea[]) => onBrainAreaFilterChange(brainAreas)}/>
                                </div>
                            </div>
                        </List.Item>
                        <List.Item>
                            <NeuronTagFilter
                                checked={state.limitTags}
                                initialValue={state.tagFilter}
                                onCheckedChange={(checked) => setState({...state, limitTags: checked, offset: 0})}
                                onValueChange={(value) => setState({...state, tagFilter: value, offset: 0})}
                            />
                        </List.Item>
                    </List>
                </Segment>
                <Segment secondary>
                    <Title order={4}>Use Metrics</Title>
                    <List horizontal divided>
                        <List.Item>
                            <MGroup>
                                <Checkbox style={{verticalAlign: "middle"}} toggle label="Brightness"
                                          checked={somaPropertiesState.limitBrightness}
                                          onChange={(_, data) => {
                                              setSomaPropertiesState({...somaPropertiesState, limitBrightness: data.checked});
                                              setState({...state, offset: 0});
                                          }}/>
                                <Select style={{maxWidth: "80px"}} disabled={!somaPropertiesState.limitBrightness} withCheckIcon={false} data={[{value: "2", label: "≤"}, {value: "3", label: "≥"}]}
                                        value={somaPropertiesState.brightnessOperator}
                                        onChange={(value) => {
                                            setSomaPropertiesState({...somaPropertiesState, brightnessOperator: value});
                                            setState({...state, offset: 0});
                                        }}/>
                                <NumberInput style={{maxWidth: "80px"}} disabled={!somaPropertiesState.limitBrightness} min={0} hideControls value={somaPropertiesState.brightness} onChange={(value) => {
                                    let v: number;
                                    if (typeof value === "string") {
                                        v = parseFloat(value);
                                    } else {
                                        v = value;
                                    }
                                    if (!isNaN(v)) {
                                        setSomaPropertiesState({...somaPropertiesState, brightness: v});
                                    }
                                }}/>
                            </MGroup>
                        </List.Item>
                        <List.Item>
                            <MGroup>
                                <Checkbox style={{verticalAlign: "middle"}} toggle label="Volume"
                                          checked={somaPropertiesState.limitVolume}
                                          onChange={(_, data) => {
                                              setSomaPropertiesState({...somaPropertiesState, limitVolume: data.checked});
                                              setState({...state, offset: 0});
                                          }}/>
                                <Select style={{maxWidth: "80px"}} disabled={!somaPropertiesState.limitVolume} withCheckIcon={false} data={[{value: "2", label: "≤"}, {value: "3", label: "≥"}]}
                                        value={somaPropertiesState.volumeOperator}
                                        onChange={(value) => {
                                            setSomaPropertiesState({...somaPropertiesState, volumeOperator: value});
                                            setState({...state, offset: 0});
                                        }}/>
                                <NumberInput style={{maxWidth: "80px"}} disabled={!somaPropertiesState.limitVolume} min={0} hideControls value={somaPropertiesState.volume} onChange={(value) => {
                                    let v: number;
                                    if (typeof value === "string") {
                                        v = parseFloat(value);
                                    } else {
                                        v = value;
                                    }
                                    if (!isNaN(v)) {
                                        setSomaPropertiesState({...somaPropertiesState, volume: v});
                                    }
                                }}/>
                            </MGroup>
                        </List.Item>
                    </List>
                </Segment>
                <Segment>
                    <PaginationHeader pageCount={pageCount} activePage={activePage} limit={state.limit}
                                      onUpdateLimitForPage={onUpdateLimit} onUpdateOffsetForPage={onUpdateOffset}/>
                </Segment>
                <Segment secondary>
                    <CandidateActionPanel neurons={data.candidateNeurons.items} neuronId={state.selectedCandidate?.id}/>
                </Segment>
                <CandidateTracingsTable neurons={(data && data.candidateNeurons) ? data.candidateNeurons.items : []}
                                        showAnnotators={state.includeInProgress}
                                        activePage={activePage} offset={state.offset} limit={state.limit}
                                        totalCount={totalCount} pageCount={pageCount}
                                        onSelected={(n => setState({
                                            ...state,
                                            selectedCandidate: n == state.selectedCandidate ? null : n
                                        }))}
                                        selectedCandidate={state.selectedCandidate}/>

            </Segment.Group>

            <CandidatesViewer neurons={(data && data.candidateNeurons) ? data.candidateNeurons.items : []}
                              selectedId={state.selectedCandidate?.id} onViewerSelected={onNeuronSelectedFromViewer}/>
        </div>
    );
}
