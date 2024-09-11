import * as React from "react";
import {useContext, useState} from "react";
import {useQuery} from "@apollo/react-hooks";
import {Button, Checkbox, Dropdown, Grid, GridColumn, GridRow, Header, Icon, List, Message, Popup, Segment} from "semantic-ui-react";
import {uniqBy} from "lodash-es";

import {CANDIDATE_NEURONS_QUERY, CandidateNeuronsResponse, NeuronsQueryVariables} from "../../graphql/candidates";
import {PaginationHeader} from "../editors/PaginationHeader";
import {CandidateTracingsTable} from "./CandidatesTable";
import {CandidatesViewer} from "./CandidateViewer";
import {IBrainArea} from "../../models/brainArea";
import {BrainAreaMultiSelect} from "../editors/BrainAreaMultiSelect";
import {ConstantsContext} from "../app/AppConstants";
import {CandidateActionPanel} from "./CandidateActionPanel";

export const Candidates = () => {
    const [state, setState] = useState({
        offset: 0,
        limit: 10,
        includeInProgress: false,
        limitSamples: false,
        sampleFilter: [],
        limitBrainAreas: false,
        brainAreaFilter: [],
        selectedCandidate: null
    });

    const constants = useContext(ConstantsContext);

    const sampleFilter = state.limitSamples ? state.sampleFilter : []

    const brainAreaFilter = state.limitBrainAreas ? state.brainAreaFilter.map(b => b.id) : []

    const {loading, error, data} = useQuery<CandidateNeuronsResponse, NeuronsQueryVariables>(CANDIDATE_NEURONS_QUERY, {
        variables: {
            input: {offset: state.offset, limit: state.limit, sampleIds: sampleFilter, brainStructureIds: brainAreaFilter},
            includeInProgress: state.includeInProgress
        },
        pollInterval: 10000
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
        setState({...state, sampleFilter: data});
    }

    const onBrainAreaFilterChange = (data: IBrainArea[]) => {
        setState({...state, brainAreaFilter: data});
    }

    const totalCount = data.candidateNeurons.totalCount;

    const pageCount = Math.max(Math.ceil(totalCount / state.limit), 1);

    const activePage = state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1;

    const reportIssueButton =
        <Button circular compact basic color="red" size="mini" icon="exclamation"/>

    const reportWithPopup = <Popup content="Report an issue with a candidate" trigger={reportIssueButton}/>

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
                            <Checkbox style={{verticalAlign: "middle"}} toggle label="Include in progress" checked={state.includeInProgress}
                                      onChange={(_, data) => setState({...state, includeInProgress: data.checked})}/>
                        </List.Item>
                        <List.Item>
                            <Checkbox style={{verticalAlign: "middle"}} toggle label="Limit samples to " checked={state.limitSamples}
                                      onChange={(_, data) => setState({...state, limitSamples: data.checked})}/>

                            <Dropdown placeholder="Select..." style={{marginLeft: "8px"}} multiple selection options={sampleFilterOptions}
                                      value={state.sampleFilter}
                                      disabled={!state.limitSamples}
                                      onChange={(_, d) => onSampleFilterChange(d.value)}/>
                        </List.Item>
                        <List.Item>
                            <div style={{display: "flex", alignItems: "center"}}>
                                <Checkbox toggle label="Limit structures to " checked={state.limitBrainAreas}
                                          onChange={(_, data) => setState({...state, limitBrainAreas: data.checked})}/>

                                <div style={{marginLeft: "8px", minWidth: "300px"}}>
                                    <BrainAreaMultiSelect compartments={constants.BrainAreasWithGeometry} selection={state.brainAreaFilter}
                                                          isDisabled={!state.limitBrainAreas}
                                                          onSelectionChange={(brainAreas: IBrainArea[]) => onBrainAreaFilterChange(brainAreas)}/>
                                </div>
                            </div>
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
                <CandidateTracingsTable neurons={(data && data.candidateNeurons) ? data.candidateNeurons.items : []} showAnnotators={state.includeInProgress}
                                        activePage={activePage} offset={state.offset} limit={state.limit} totalCount={totalCount} pageCount={pageCount}
                                        onSelected={(n => setState({...state, selectedCandidate: n == state.selectedCandidate ? null : n}))}
                                        selectedCandidate={state.selectedCandidate}/>

            </Segment.Group>
            
            <CandidatesViewer neurons={(data && data.candidateNeurons) ? data.candidateNeurons.items : []} selectedId={state.selectedCandidate?.id}/>
        </div>
    );
}
