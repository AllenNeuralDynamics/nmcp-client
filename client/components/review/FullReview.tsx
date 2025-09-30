import * as React from "react";
import {useState} from "react";
import {useQuery} from "@apollo/client";
import {Checkbox, Dropdown, Header, List, Segment} from "semantic-ui-react";

import {IReconstruction} from "../../models/reconstruction";
import {FullReviewTable} from "./FullReviewTable";
import {SelectedReconstruction} from "./SelectedReconstruction";
import {REVIEWABLE_ANNOTATIONS_QUERY, ReviewableResponse, ReviewableVariables} from "../../graphql/reconstruction";
import {PaginationHeader} from "../common/PaginationHeader";
import {SAMPLES_QUERY, SamplesQueryResponse} from "../../graphql/sample";
import {UPLOAD_TRACING_MUTATION} from "../../graphql/tracings";

const statusFilterOptions = [
    {key: "in-review", text: "In Review", value: 3},
    {key: "approved", text: "Approved", value: 5},
]

interface ReviewState {
    offset: number;
    limit: number;
    limitSamples: boolean;
    sampleId: string[];
    limitStatus: boolean;
    statusFilter: number[];
    selected: IReconstruction;
}

export const FullReview = () => {
    const [state, setState] = useState<ReviewState>({
        offset: 0,
        limit: 10,
        limitSamples: false,
        sampleId: [],
        limitStatus: false,
        statusFilter: [],
        selected: null
    });

    const filters: number[] = state.limitStatus ? state.statusFilter : []

    const sampleIds = state.limitSamples ? state.sampleId : [];

    const {loading, error, data} = useQuery<ReviewableResponse, ReviewableVariables>(REVIEWABLE_ANNOTATIONS_QUERY, {
        variables: {input: {offset: state.offset, limit: state.limit, sampleIds: sampleIds, status: filters}},
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

    const onStatusFilterChange = (data: number[]) => {
        setState({...state, statusFilter: data});
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

    const totalCount = data.reviewableReconstructions.totalCount;

    const pageCount = Math.max(Math.ceil(totalCount / state.limit), 1);

    const activePage = Math.min(state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1, pageCount);

    if (state.selected) {
        const stillAvailable = data.reviewableReconstructions.reconstructions.some(r => r.id === state.selected.id);

        if (!stillAvailable) {
            setState({...state, selected: null});
        }
    }

    const onRowClick = (reconstruction: IReconstruction) => {
        setState({...state, selected: reconstruction});
    }

    return (
        <div style={{margin: "20px"}}>
            <Segment.Group>
                <Segment secondary>
                    <Header style={{margin: "0"}}>Reconstructions Submitted for Review</Header>
                </Segment>
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
                            <Checkbox toggle label="Limit status to " checked={state.limitStatus}
                                      onChange={(_, data) => setState({...state, limitStatus: data.checked})}/>
                            <Dropdown placeholder="Status" style={{marginLeft: "8px"}} multiple selection
                                      options={statusFilterOptions}
                                      value={state.statusFilter}
                                      disabled={!state.limitStatus}
                                      onChange={(_, d) => onStatusFilterChange(d.value as number[])}/>
                        </List.Item>
                    </List>
                </Segment>
                <Segment>
                    <PaginationHeader pageCount={pageCount} activePage={activePage}
                                      limit={state.limit}
                                      onUpdateLimitForPage={onUpdateLimit}
                                      onUpdateOffsetForPage={onUpdateOffsetForPage}/>
                </Segment>
                <FullReviewTable reconstructions={data.reviewableReconstructions.reconstructions} selected={state.selected}
                                 totalCount={totalCount} offset={state.offset} limit={state.limit} onRowClick={onRowClick}
                                 isFiltered={state.limitStatus || state.limitSamples}/>
            </Segment.Group>

            {totalCount > 0 ? <SelectedReconstruction reconstruction={state.selected} mutation={UPLOAD_TRACING_MUTATION}
                                                      refetchQueries={["ReviewableReconstructions", "CandidatesForReview"]}/> : null}
        </div>
    );
}
