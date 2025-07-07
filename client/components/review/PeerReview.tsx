import * as React from "react";
import {useState} from "react";
import {useQuery} from "@apollo/client";
import {SAMPLES_QUERY, SamplesQueryResponse} from "../../graphql/sample";
import {PEER_REVIEWABLE_ANNOTATIONS_QUERY, PeerReviewableVariables, PeerReviewableResponse} from "../../graphql/reconstruction";
import {Checkbox, Dropdown, Header, Input, List, Segment} from "semantic-ui-react";
import {PaginationHeader} from "../editors/PaginationHeader";
import {PeerReviewTable} from "./PeerReviewTable";
import {NeuronTagFilter} from "../editors/NeuronTagFilter";

interface PeerReviewState {
    offset: number;
    limit: number;
    limitSamples: boolean;
    sampleId: string[];
    limitTag: boolean;
    tag: string;
    tempTagFilter: string;
}

export const PeerReview = () => {
    const [state, setState] = useState<PeerReviewState>({
        offset: 0,
        limit: 10,
        limitSamples: false,
        sampleId: [],
        limitTag: false,
        tag: "",
        tempTagFilter: ""
    });

    const sampleIds = state.limitSamples ? state.sampleId : [];

    const {loading, error, data} = useQuery<PeerReviewableResponse, PeerReviewableVariables>(PEER_REVIEWABLE_ANNOTATIONS_QUERY, {
        variables: {input: {offset: state.offset, limit: state.limit, sampleIds: sampleIds, tag: state.limitTag ? state.tag : null}},
        pollInterval: 10000
    });

    const {
        loading: sampleLoading,
        error: sampleError,
        data: sampleData
    } = useQuery<SamplesQueryResponse>(SAMPLES_QUERY, {pollInterval: 5000});

    if (loading || sampleLoading) {
        return (<div/>)
    }

    if (error || sampleError) {
        return (<div>
            {error.graphQLErrors.map(({message}, i) => (
                <span key={i}>{message}</span>))}
        </div>)
    }

    let samples = sampleData.samples.items;

    const sampleFilterOptions = samples.slice().sort((s1, s2) => s1.animalId < s2.animalId ? -1 : 1).map(s => {
        return {key: s.id, text: s.animalId, value: s.id}
    });


    const onUpdateOffsetForPage = (page: number) => {
        const offset = state.limit * (page - 1);

        if (offset !== state.offset) {
            setState({...state, offset});
        }
    };

    const onTagFilterChange = (data: string) => {
        setState({...state, tag: data});
    }

    const onSampleFilterChange = (data: any) => {
        setState({...state, sampleId: data});
    }

    const onUpdateLimit = (limit: number) => {
        if (limit !== state.limit) {
            let offset = state.offset;

            if (offset < limit) {
                offset = 0;
            }

            setState({...state, offset, limit});
        }
    };

    const totalCount = data.peerReviewableReconstructions.totalCount;

    const pageCount = Math.max(Math.ceil(totalCount / state.limit), 1);

    const activePage = Math.min(state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1, pageCount);

    return (
        <div>
            <div style={{margin: "20px"}}>
                <Segment.Group>
                    <Segment secondary>
                        <List horizontal divided>
                            <List.Item>
                                <Checkbox style={{verticalAlign: "middle"}} toggle label="Limit samples to "
                                          checked={state.limitSamples}
                                          onChange={(_, data) => setState({...state, limitSamples: data.checked})}/>

                                <Dropdown placeholder="Select..." style={{marginLeft: "8px"}} multiple selection
                                          options={sampleFilterOptions}
                                          value={state.sampleId}
                                          disabled={!state.limitSamples}
                                          onChange={(_, d) => onSampleFilterChange(d.value)}/>
                            </List.Item>
                            <List.Item>
                                <NeuronTagFilter
                                    checked={state.limitTag}
                                    initialValue={state.tag}
                                    onCheckedChange={(checked) => setState({...state, limitTag: checked, offset: 0})}
                                    onValueChange={(value) => setState({...state, tag: value, offset: 0})}
                                />
                            </List.Item>
                        </List>
                    </Segment>
                    <Segment>
                        <PaginationHeader pageCount={pageCount} activePage={activePage}
                                          limit={state.limit}
                                          onUpdateLimitForPage={onUpdateLimit}
                                          onUpdateOffsetForPage={onUpdateOffsetForPage}/>
                    </Segment>
                    <Segment secondary>
                        <Header style={{margin: "0"}}>Reconstructions Submitted for Peer Review</Header>
                    </Segment>
                    <PeerReviewTable reconstructions={data.peerReviewableReconstructions.reconstructions}
                                     totalCount={totalCount} offset={state.offset} limit={state.limit}
                                     isFiltered={state.limitTag || state.limitSamples}/>
                </Segment.Group>
            </div>
        </div>
    );
}
