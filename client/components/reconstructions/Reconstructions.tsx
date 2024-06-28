import * as React from "react";
import {useContext, useState} from "react";
import moment from "moment";
import {Button, Checkbox, Dropdown, Header, Label, Segment, Table, TableCell, TableRow} from "semantic-ui-react";
import {useMutation, useQuery} from "@apollo/react-hooks";

import {
    RECONSTRUCTIONS_QUERY,
    ReconstructionVariables,
    ReconstructionsResponse,
    REQUEST_ANNOTATION_REVIEW_MUTATION,
    CancelAnnotationMutationResponse,
    CancelAnnotationVariables,
    CANCEL_ANNOTATION_MUTATION,
    RequestAnnotationResponse,
    RequestAnnotationVariables,
    REQUEST_ANNOTATION_MUTATION,
    RequestAnnotationHoldResponse,
    RequestAnnotationHoldVariables,
    REQUEST_ANNOTATION_HOLD_MUTATION,
    RequestAnnotationReviewResponse, RequestAnnotationReviewVariables
} from "../../graphql/reconstruction";
import {displayNeuron} from "../../models/neuron";
import {displayBrainArea} from "../../models/brainArea";
import {IReconstruction} from "../../models/reconstruction";
import {PaginationHeader} from "../editors/PaginationHeader";
import {CompleteReconstructionDialog} from "./CompleteReconstructionDialog";
import {UserContext} from "../app/UserApp";
import {AnnotationStatus, annotationStatusColor, displayAnnotationStatus} from "../../models/annotationStatus";
import {AnnotatorList} from "../annotator/AnnotatorList";

const statusFilterOptions = [
    {key: "complete", text: "Complete", value: 8},
    {key: "inprogress", text: "In Progress", value: 1},
    {key: "onhold", text: "On Hold", value: 2},
    {key: "inreview", text: "In Review", value: 3},
    {key: "approved", text: "Approved", value: 5},
    {key: "rejected", text: "Rejected", value: 6},
    {key: "invalid", text: "Invalid", value: 9},
    {key: "cancelled", text: "Cancelled", value: 7}
]

function noReconstructionsText(userOnly: boolean, haveFilters: boolean) {
    return userOnly || haveFilters ? "There are no reconstructions that match the filters" : "There are no reconstructions";
}

export const Reconstructions = () => {
    const [state, setState] = useState({
        offset: 0,
        limit: 10,
        userOnly: false,
        limitStatus: false,
        statusFilter: []
    });

    const [isCompleteDialogVisible, setIsCompleteDialogVisible] = useState(false);

    const [markCompleteId, setMarkCompleteId] = useState("");

    const user = useContext(UserContext);

    const filters: number[] = state.limitStatus ? state.statusFilter : []

    const {loading, error, data} = useQuery<ReconstructionsResponse, ReconstructionVariables>(RECONSTRUCTIONS_QUERY, {
        variables: {pageInput: {offset: state.offset, limit: state.limit, userOnly: state.userOnly, filters: filters}}, pollInterval: 10000
    });

    if (loading || !data || !data.reconstructions) {
        return (<div/>)
    }

    const rows = data.reconstructions.reconstructions.map((t: IReconstruction) => {
        return <ReconstructionRow key={`tt_${t.id}`} annotation={t} userId={user.id} showCompleteDialog={(id: string) => {
            setMarkCompleteId(id);
            setIsCompleteDialogVisible(true);
        }}/>
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
        setState({...state, statusFilter: data});
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
                    <Header as="h4">Filters</Header>
                    <Checkbox toggle label="My reconstructions only" checked={state.userOnly}
                              onChange={(e, data) => setState({...state, userOnly: data.checked})}/>
                    <p/>
                    <Checkbox toggle label="Limit status to " checked={state.limitStatus}
                              onChange={(e, data) => setState({...state, limitStatus: data.checked})}/>
                    <Dropdown placeholder="Status" style={{marginLeft: "8px"}} multiple selection options={statusFilterOptions} value={state.statusFilter}
                              disabled={!state.limitStatus}
                              onChange={(e, d) => onStatusFilterChange(d.value as number[])}/>
                </Segment>
                <Segment>
                    <PaginationHeader pageCount={pageCount} activePage={activePage}
                                      limit={state.limit}
                                      onUpdateLimitForPage={onUpdateLimit}
                                      onUpdateOffsetForPage={onUpdateOffsetForPage}/>
                </Segment>
                <Table attached="bottom" compact="very" size="small" celled structured>
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
                            <Table.HeaderCell rowSpan={2}>Actions</Table.HeaderCell>
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
    annotation: IReconstruction;
    userId: string;

    showCompleteDialog(id: string): void;
}

const ReconstructionRow = (props: IReconstructionRowProps) => {
    const [cancelAnnotation, {data: cancelData}] = useMutation<CancelAnnotationMutationResponse, CancelAnnotationVariables>(CANCEL_ANNOTATION_MUTATION,
        {
            refetchQueries: ["ReconstructionsQuery"]
        });

    const [requestAnnotation, {data: requestData}] = useMutation<RequestAnnotationResponse, RequestAnnotationVariables>(REQUEST_ANNOTATION_MUTATION,
        {
            refetchQueries: ["ReconstructionsQuery"]
        });

    const [requestAnnotationHold, {data: holdData}] = useMutation<RequestAnnotationHoldResponse, RequestAnnotationHoldVariables>(REQUEST_ANNOTATION_HOLD_MUTATION,
        {
            refetchQueries: ["ReconstructionsQuery"]
        });

    const [requestAnnotationReview, {data: reviewData}] = useMutation<RequestAnnotationReviewResponse, RequestAnnotationReviewVariables>(REQUEST_ANNOTATION_REVIEW_MUTATION,
        {
            refetchQueries: ["ReconstructionsQuery"]
        });

    let reopenButton = null;
    let holdButton = null;
    let reviewButton = null;
    let cancelButton = null;

    if (props.annotation.annotatorId == props.userId) {
        if (props.annotation.status != AnnotationStatus.Cancelled && props.annotation.status != AnnotationStatus.Complete) {
            cancelButton = (
                <Button icon="cancel" size="mini" color='red' content="Cancel" onClick={() => cancelAnnotation({variables: {id: props.annotation.id}})}/>)
        }

        if (props.annotation.status == AnnotationStatus.Cancelled || props.annotation.status == AnnotationStatus.InReview || props.annotation.status == AnnotationStatus.OnHold) {
            reopenButton = (<Button icon="folder open outline" color="green" size="mini" content="Reopen"
                                    onClick={() => requestAnnotation({variables: {id: props.annotation.neuron.id}})}/>)
        }

        if (props.annotation.status == AnnotationStatus.InProgress) {
            reviewButton = (<Button icon="check circle outline" size="mini" color="violet" content="Request Review"
                                    onClick={() => props.showCompleteDialog(props.annotation.id)}/>)
            holdButton = (
                <Button icon="pause" size="mini" color="yellow" content="Hold" onClick={() => requestAnnotationHold({variables: {id: props.annotation.id}})}/>)
        }
    }

    return (<TableRow>
            <TableCell>{displayNeuron(props.annotation.neuron)}</TableCell>
            <TableCell>{props.annotation.neuron.sample.animalId}</TableCell>
            <TableCell>{displayBrainArea(props.annotation.neuron.brainArea, "(unspecified)")}</TableCell>
            <TableCell>{props.annotation.neuron.x.toFixed(1)}</TableCell>
            <TableCell>{props.annotation.neuron.y.toFixed(1)}</TableCell>
            <TableCell>{props.annotation.neuron.z.toFixed(1)}</TableCell>
            <TableCell>{props.annotation.axon ? props.annotation.axon.nodeCount : "N/A"}</TableCell>
            <TableCell>{props.annotation.dendrite ? props.annotation.dendrite.nodeCount : "N/A"}</TableCell>
            <TableCell><AnnotatorList annotations={[props.annotation]} showCompleteOnly={false} showStatus={false} showProofreader={false}/></TableCell>
            <TableCell><AnnotatorList annotations={[props.annotation]} showCompleteOnly={false} showStatus={false} showProofreader={true}/></TableCell>
            <TableCell>{props.annotation.startedAt ? moment(props.annotation.startedAt).format("YYYY-MM-DD") : "N/A"}</TableCell>
            <TableCell>{props.annotation.completedAt ? moment(props.annotation.completedAt).format("YYYY-MM-DD") : "N/A"}</TableCell>
            <TableCell>
                <Label basic size="tiny" color={annotationStatusColor(props.annotation.status)}>{displayAnnotationStatus(props.annotation.status)}</Label>
            </TableCell>
            <TableCell>
                {reviewButton}
                {holdButton}
                {reopenButton}
                {cancelButton}
            </TableCell>
        </TableRow>
    );
}
