import * as React from "react";
import {useContext, useState} from "react";
import {useQuery} from "@apollo/react-hooks";
import {Checkbox, Dropdown, Header, Icon, Message, Segment} from "semantic-ui-react";
import {uniqBy} from "lodash-es";

import {CANDIDATE_NEURONS_QUERY, CandidateNeuronsResponse, NeuronsQueryVariables} from "../../graphql/candidates";
import {PaginationHeader} from "../editors/PaginationHeader";
import {CandidateTracingsTable} from "./CandidatesTable";
import {CandidatesViewer} from "./CandidateViewer";
import {IBrainArea} from "../../models/brainArea";
import {BrainAreaMultiSelect} from "../editors/BrainAreaMultiSelect";
import {ConstantsContext} from "../app/AppConstants";

export const Candidates = () => {
    const [state, setState] = useState({
        offset: 0,
        limit: 10,
        limitSamples: false,
        sampleFilter: [],
        limitBrainAreas: false,
        brainAreaFilter: []
    });

    const constants = useContext(ConstantsContext);

    const sampleFilter = state.limitSamples ? state.sampleFilter : []

    const brainAreaFilter = state.limitBrainAreas ? state.brainAreaFilter.map(b => b.id) : []

    const {loading, error, data} = useQuery<CandidateNeuronsResponse, NeuronsQueryVariables>(CANDIDATE_NEURONS_QUERY, {
        variables: {input: {offset: state.offset, limit: state.limit, sampleIds: sampleFilter, brainStructureIds: brainAreaFilter}}, pollInterval: 10000
    });

    if (loading || !data || !data.candidateNeurons) {
        return <Message icon>
            <Icon name="circle notched" loading/>
            <Message.Content>
                <Message.Header content="Updating candidate neurons"/>
                Updating candidate neurons.
            </Message.Content>
        </Message>
    }

    if (error) {
        return <Message negative style={{margin: "20px"}}>
            <Icon name="circle notched" loading/>
            <Message.Content>
                <Message.Header content="Error"/>
                {error}
            </Message.Content>
        </Message>
    }

    const samples = uniqBy(data.candidateNeurons.items.map(n => n.sample), (s) => s.id);

    const sampleFilterOptions = samples.map(s => {
        return {key: s.id, text: s.animalId, value: s.id}
    });

    const onUpdateOffsetForPage = (page: number) => {
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
        setState({...state, sampleFilter: data});
    }

    const onBrainAreaFilterChange = (data: IBrainArea[]) => {
        setState({...state, brainAreaFilter: data});
    }

    const totalCount = data.candidateNeurons.totalCount;

    const pageCount = Math.max(Math.ceil(totalCount / state.limit), 1);

    const activePage = state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1;

    return (
        <div style={{margin: "20px"}}>
            <Segment.Group>
                <Segment secondary>
                    <Header style={{margin: "0"}}>Candidate Neurons</Header>
                </Segment>
                <Segment secondary>
                    <Checkbox style={{verticalAlign: "middle"}} toggle label="Limit samples to " checked={state.limitSamples} onChange={(_, data) => setState({...state, limitSamples: data.checked})}/>
                    <Dropdown placeholder="Select..." style={{marginLeft: "8px"}} multiple selection options={sampleFilterOptions} value={state.sampleFilter} disabled={!state.limitSamples}
                              onChange={(_, d) => onSampleFilterChange(d.value)}/>
                    <p/>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <Checkbox toggle label="Limit brain areas to " checked={state.limitBrainAreas} onChange={(_, data) => setState({...state, limitBrainAreas: data.checked})}/>

                        <div style={{marginLeft: "8px", minWidth: "300px"}}>
                            <BrainAreaMultiSelect compartments={constants.BrainAreas} selection={state.brainAreaFilter} isDisabled={!state.limitBrainAreas}
                                                  onSelectionChange={(brainAreas: IBrainArea[]) => onBrainAreaFilterChange(brainAreas)}/>
                        </div>
                    </div>
                </Segment>
                <Segment>
                    <PaginationHeader pageCount={pageCount} activePage={activePage}
                                      limit={state.limit}
                                      onUpdateLimitForPage={onUpdateLimit}
                                      onUpdateOffsetForPage={onUpdateOffsetForPage}/>
                </Segment>
                <CandidateTracingsTable neurons={(data && data.candidateNeurons) ? data.candidateNeurons.items : []}
                                        offset={state.offset}
                                        limit={state.limit} totalCount={totalCount} pageCount={pageCount}
                                        activePage={activePage}/>
            </Segment.Group>

            <CandidatesViewer neurons={(data && data.candidateNeurons) ? data.candidateNeurons.items : []}/>
        </div>
    );
}
