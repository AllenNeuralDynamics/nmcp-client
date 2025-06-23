import * as React from "react";
import {useContext, useState} from "react";
import moment from "moment";
import {Checkbox, Dropdown, Header, Label, List, Segment, Table, TableCell, TableRow} from "semantic-ui-react";
import {useQuery} from "@apollo/client";

import {RECONSTRUCTIONS_QUERY, ReconstructionVariables, ReconstructionsResponse} from "../../graphql/reconstruction";
import {displayNeuron} from "../../models/neuron";
import {displayBrainArea} from "../../models/brainArea";
import {IReconstruction} from "../../models/reconstruction";
import {PaginationHeader} from "../editors/PaginationHeader";
import {CompleteReconstructionDialog} from "./CompleteReconstructionDialog";
import {UserContext} from "../app/UserApp";
import {reconstructionStatusColor, reconstructionStatusString} from "../../models/reconstructionStatus";
import {AnnotatorList} from "../annotator/AnnotatorList";
import {ReconstructionActionPanel} from "./ReconstructionActionPanel";
import {SAMPLES_QUERY, SamplesQueryResponse} from "../../graphql/sample";
import {UserPreferences} from "../../util/userPreferences";

const statusFilterOptions = [
    {key: "complete", text: "Published", value: 8},
    {key: "in-progress", text: "In Progress", value: 1},
    {key: "on-hold", text: "On Hold", value: 2},
    {key: "in-review", text: "In Review", value: 3},
    {key: "approved", text: "Approved", value: 5},
    {key: "rejected", text: "Rejected", value: 6},
    {key: "invalid", text: "Invalid", value: 9}
]

function noReconstructionsText(userOnly: boolean, haveFilters: boolean) {
    return userOnly || haveFilters ? "There are no reconstructions that match the filters" : "There are no reconstructions";
}

export const Reconstructions = () => {
    const [state, setState] = useState({
        offset: 0,
        limit: 10,
        userOnly: UserPreferences.Instance.ReconstructionNeuronsUserOnly,
        limitStatus: false,
        statusFilter: [],
        limitSamples: false,
        sampleIds: [],
        selectedId: null
    });

    const [isCompleteDialogVisible, setIsCompleteDialogVisible] = useState(false);

    const [markCompleteId, setMarkCompleteId] = useState("");

    const user = useContext(UserContext);

    const filters: number[] = state.limitStatus ? state.statusFilter : []

    const sampleIds = state.limitSamples ? state.sampleIds : [];

    const {loading, error, data} = useQuery<ReconstructionsResponse, ReconstructionVariables>(RECONSTRUCTIONS_QUERY, {
        variables: {pageInput: {offset: state.offset, limit: state.limit, userOnly: state.userOnly, filters: filters, sampleIds: sampleIds}},
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

    if (!data || !data.reconstructions) {
        return (<div>Data unavailable</div>)
    }

    let samples = sampleData.samples.items;

    const sampleFilterOptions = samples.slice().sort((s1, s2) => s1.animalId < s2.animalId ? -1 : 1).map(s => {
        return {key: s.id, text: s.animalId, value: s.id}
    });

    const onUserOnlyChange = (userOnly: boolean) => {
        UserPreferences.Instance.ReconstructionNeuronsUserOnly = userOnly;
        setState({...state, userOnly: userOnly})
    }

    const onSampleFilterChange = (data: any) => {
        setState({...state, sampleIds: data, offset: 0});
    }

    const onSelected = (reconstruction: IReconstruction) => {
        setState({...state, selectedId: reconstruction?.id == state.selectedId ? null : reconstruction?.id});
    }

    let selectedReconstruction = null;

    const rows = data.reconstructions.reconstructions.map((t: IReconstruction) => {
        if (t.id == state.selectedId) {
            selectedReconstruction = t;
        }
        return <ReconstructionRow key={`tt_${t.id}`} reconstruction={t} isSelected={t.id == state.selectedId} onSelected={onSelected}/>
    });

    const completeDialog = isCompleteDialogVisible ? (
        <CompleteReconstructionDialog id={markCompleteId} show={true} onClose={() => setIsCompleteDialogVisible(false)}/>) : null;

    const onUpdateOffsetForPage = (page: number) => {
        const offset = state.limit * (page - 1);

        if (offset !== state.offset) {
            setState({...state, offset});
        }
    };

    const onStatusFilterChange = (data: number[]) => {
        setState({...state, statusFilter: data, offset: 0});
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

    const totalCount = data.reconstructions.totalCount;

    const pageCount = Math.max(Math.ceil(totalCount / state.limit), 1);

    const activePage = state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1;

    const start = state.offset + 1;

    const end = Math.min(state.offset + state.limit, totalCount);

    return (
        <div style={{margin: "16px"}}>
            {completeDialog}
            <Segment.Group>
                <Segment secondary>
                    <Header style={{margin: "0"}}>Reconstructions</Header>
                </Segment>
                <Segment secondary>
                    <List horizontal divided>
                        <List.Item>
                            <Checkbox toggle label="My reconstructions only" checked={state.userOnly}
                                      onChange={(_, data) => onUserOnlyChange(data.checked)}/>
                        </List.Item>
                        <List.Item>
                            <Checkbox style={{verticalAlign: "middle"}} toggle label="Limit samples to "
                                      checked={state.limitSamples}
                                      onChange={(_, data) => setState({...state, limitSamples: data.checked})}/>

                            <Dropdown placeholder="Select..." style={{marginLeft: "8px"}} multiple selection
                                      options={sampleFilterOptions}
                                      value={state.sampleIds}
                                      disabled={!state.limitSamples}
                                      onChange={(_, d) => onSampleFilterChange(d.value)}/>
                        </List.Item>
                        <List.Item>
                            <Checkbox toggle label="Limit status to " checked={state.limitStatus}
                                      onChange={(_, data) => setState({...state, limitStatus: data.checked})}/>
                            <Dropdown placeholder="Status" style={{marginLeft: "8px"}} multiple selection options={statusFilterOptions}
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
                <Segment secondary>
                    <ReconstructionActionPanel reconstruction={selectedReconstruction} userId={user.id} showCompleteDialog={(id: string) => {
                        setMarkCompleteId(id);
                        setIsCompleteDialogVisible(true);
                    }}/>
                </Segment>
                <Table attached="bottom" compact="very" size="small" celled structured selectable>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell rowSpan={2}>Neuron</Table.HeaderCell>
                            <Table.HeaderCell rowSpan={2}>Subject</Table.HeaderCell>
                            <Table.HeaderCell colSpan={4} textAlign="center">Soma</Table.HeaderCell>
                            <Table.HeaderCell colSpan={2} textAlign="center">Node Count</Table.HeaderCell>
                            <Table.HeaderCell rowSpan={2}>Annotator</Table.HeaderCell>
                            <Table.HeaderCell rowSpan={2}>Proofreader</Table.HeaderCell>
                            <Table.HeaderCell rowSpan={2}>Started</Table.HeaderCell>
                            <Table.HeaderCell rowSpan={2}>Completed</Table.HeaderCell>
                            <Table.HeaderCell rowSpan={2}>Status</Table.HeaderCell>
                        </Table.Row>
                        <Table.Row>
                            <Table.HeaderCell>Structure</Table.HeaderCell>
                            <Table.HeaderCell>X</Table.HeaderCell>
                            <Table.HeaderCell>Y</Table.HeaderCell>
                            <Table.HeaderCell>Z</Table.HeaderCell>
                            <Table.HeaderCell>Axon</Table.HeaderCell>
                            <Table.HeaderCell>Dendrite</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                    <Table.Footer fullwidth="true">
                        <Table.Row>
                            <Table.HeaderCell colSpan={7}>
                                {totalCount >= 0 ? (totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} reconstructions` : noReconstructionsText(state.userOnly, filters.length > 0)) : ""}
                            </Table.HeaderCell>
                            <Table.HeaderCell colSpan={7} textAlign="right">
                                {`Page ${activePage} of ${pageCount}`}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            </Segment.Group>
        </div>
    );
}

interface IReconstructionRowProps {
    reconstruction: IReconstruction;
    isSelected: boolean;

    onSelected: (reconstruction: IReconstruction) => void;
}

const ReconstructionRow = (props: IReconstructionRowProps) => {
    return (
        <TableRow active={props.isSelected} onClick={() => props.onSelected(props.reconstruction)}>
            <TableCell>{displayNeuron(props.reconstruction.neuron)}</TableCell>
            <TableCell>{props.reconstruction.neuron.sample.animalId}</TableCell>
            <TableCell>{displayBrainArea(props.reconstruction.neuron.brainArea, "(unspecified)")}</TableCell>
            <TableCell>{props.reconstruction.neuron.x.toFixed(1)}</TableCell>
            <TableCell>{props.reconstruction.neuron.y.toFixed(1)}</TableCell>
            <TableCell>{props.reconstruction.neuron.z.toFixed(1)}</TableCell>
            <TableCell>{props.reconstruction.axon ? props.reconstruction.axon.nodeCount : "N/A"}</TableCell>
            <TableCell>{props.reconstruction.dendrite ? props.reconstruction.dendrite.nodeCount : "N/A"}</TableCell>
            <TableCell><AnnotatorList annotations={[props.reconstruction]} showCompleteOnly={false} showStatus={false} showProofreader={false}/></TableCell>
            <TableCell><AnnotatorList annotations={[props.reconstruction]} showCompleteOnly={false} showStatus={false} showProofreader={true}/></TableCell>
            <TableCell>{props.reconstruction.startedAt ? moment(props.reconstruction.startedAt).format("YYYY-MM-DD") : "N/A"}</TableCell>
            <TableCell>{props.reconstruction.completedAt ? moment(props.reconstruction.completedAt).format("YYYY-MM-DD") : "N/A"}</TableCell>
            <TableCell>
                <Label basic size="tiny"
                       color={reconstructionStatusColor(props.reconstruction.status)}>{reconstructionStatusString(props.reconstruction.status)}</Label>
            </TableCell>
        </TableRow>
    );
}
