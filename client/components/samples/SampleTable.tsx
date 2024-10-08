import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/react-hooks";
import {Button, Confirm, Header, List, Segment, Table} from "semantic-ui-react";
import {toast} from "react-toastify";

import {displaySample, ISample} from "../../models/sample";
import {IMouseStrain} from "../../models/mouseStrain";
import {SampleRow} from "./SampleRow";
import {
    CREATE_SAMPLE_MUTATION,
    CreateSampleMutationResponse,
    CreateSampleVariables,
    DELETE_SAMPLE_MUTATION, DeleteSampleMutationResponse, DeleteSampleVariables,
    UPDATE_SAMPLE_MUTATION, UpdateSampleMutationResponse, UpdateSampleVariables
} from "../../graphql/sample";
import {toastCreateError, toastDeleteError, toastUpdateError} from "../editors/Toasts";
import {UserPreferences} from "../../util/userPreferences";
import {ManageInjections} from "../injections/ManageInjections";
import {displayInjection, IInjection} from "../../models/injection";
import {PaginationHeader} from "../editors/PaginationHeader";
import {ICollection} from "../../models/collection";

export type SamplesTableProps = {
    samples: ISample[];
    collections: ICollection[];
    mouseStrains: IMouseStrain[];
}

type SamplesState = {
    offset?: number;
    limit?: number;
    requestedSampleForDelete?: ISample;
    isInjectionDialogShown?: boolean;
    manageInjectionsSample?: ISample;
}

export const SamplesTable = (props: SamplesTableProps) => {
    const [createSample] = useMutation<CreateSampleMutationResponse, CreateSampleVariables>(CREATE_SAMPLE_MUTATION,
        {
            refetchQueries: ["SamplesQuery"],
            // onCompleted: (data) => onSampleCreated(data.createSample),
            onError: (error) => toast.error(toastCreateError(error), {autoClose: false})
        });

    const [updateSample] = useMutation<UpdateSampleMutationResponse, UpdateSampleVariables>(UPDATE_SAMPLE_MUTATION,
        {
            // onCompleted: (data) => onSampleUpdated(data.updateSample),
            onError: (error) => toast.error(toastUpdateError(error), {autoClose: false})
        });

    const [deleteSample] = useMutation<DeleteSampleMutationResponse, DeleteSampleVariables>(DELETE_SAMPLE_MUTATION,
        {
            refetchQueries: ["SamplesQuery"],
            onError: (error) => toast.error(toastDeleteError(error), {autoClose: false})
        });

    const [state, setState] = useState<SamplesState>({
        offset: UserPreferences.Instance.samplePageOffset,
        limit: UserPreferences.Instance.samplePageLimit,
        requestedSampleForDelete: null,
        isInjectionDialogShown: false,
        manageInjectionsSample: null
    })

    const onUpdateOffsetForPage = (page: number) => {
        const offset = state.limit * (page - 1);

        if (offset !== state.offset) {
            setState({...state, offset});

            UserPreferences.Instance.samplePageOffset = offset;
        }
    }

    const onUpdateLimit = (limit: number) => {
        if (limit !== state.limit) {
            let offset = state.offset;

            if (offset < limit) {
                offset = 0;
            }

            setState({...state, offset, limit});

            UserPreferences.Instance.samplePageOffset = offset;
            UserPreferences.Instance.samplePageLimit = limit;
        }
    }

    const onRequestManageInjections = (forSample: ISample) => {
        setState({
            ...state,
            isInjectionDialogShown: true,
            manageInjectionsSample: forSample
        });
    }

    const renderInjectionsDialog = () => {
        if (state.manageInjectionsSample && state.isInjectionDialogShown) {
            return (
                <ManageInjections sample={state.manageInjectionsSample}
                                  show={state.isInjectionDialogShown}
                                  onClose={() => setState({...state, isInjectionDialogShown: false})}/>
            );
        } else {
            return null;
        }
    }

    const renderDeleteConfirmationModal = () => {
        if (!state.requestedSampleForDelete) {
            return null;
        }

        return <Confirm open={true} dimmer="blurring"
                        header="Delete Sample?"
                        content={`Are you sure you want to delete the sample ${displaySample(state.requestedSampleForDelete)}?  This action can not be undone.`}
                        confirmButton="Delete"
                        onCancel={() => setState({...state, requestedSampleForDelete: null})}
                        onConfirm={async () => {
                            await deleteSample({variables: {id: state.requestedSampleForDelete.id}});
                            setState({...state, requestedSampleForDelete: null});
                        }}/>
    }

    const renderInjections = (injections: IInjection[], isExpanded: boolean) => {
        if (!injections || injections.length === 0) {
            return "(none)";
        }

        if (injections.length === 1) {
            return displayInjection(injections[0], 28);
        }

        if (!isExpanded) {
            return `${injections.length} injections`;
        }

        const rows = injections.map(i => (
            <List.Item key={`sil_${i.id}`}>
                {displayInjection(i, 28)}
            </List.Item>)
        );

        return <List>{rows} </List>;
    }

    const setSampleForDelete = (sample: ISample) => {
        setState({...state, requestedSampleForDelete: sample})
    };

    const samples = [...props.samples].sort(
        (a, b) => b.idNumber - a.idNumber)
        .slice(state.offset, state.offset + state.limit);

    const totalCount = props.samples.length;

    const pageCount = Math.ceil(totalCount / state.limit);

    const activePage = (state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1);

    const start = state.offset + 1;

    const end = Math.min(state.offset + state.limit, totalCount);

    const rows = samples.map(s => {
        return <SampleRow key={s.id} sample={s} mouseStrains={props.mouseStrains} collections={props.collections} renderInjections={renderInjections}
                          setSampleForDelete={setSampleForDelete} onRequestManageInjections={onRequestManageInjections}
                          updateFcn={sample => updateSample({variables: {sample}})}/>
    });

    return (
        <div>
            {renderInjectionsDialog()}
            {renderDeleteConfirmationModal()}
            <Segment.Group>
                <Segment secondary style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                    <Header content="Samples" style={{margin: "0"}}/>
                    <Button content="Add" icon="add" size="tiny" labelPosition="right" color="blue" floated="right"
                            onClick={() => createSample({variables: {sample: {}}})}/>
                </Segment>
                <Segment>
                    <PaginationHeader pageCount={pageCount} activePage={activePage} limit={state.limit}
                                      onUpdateLimitForPage={limit => onUpdateLimit(limit)}
                                      onUpdateOffsetForPage={page => onUpdateOffsetForPage(page)}/>
                </Segment>
                <Table attached="top" compact="very" size="small">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Subject Id</Table.HeaderCell>
                            <Table.HeaderCell>Acq. Date</Table.HeaderCell>
                            <Table.HeaderCell>Tag</Table.HeaderCell>
                            <Table.HeaderCell>Genotype</Table.HeaderCell>
                            <Table.HeaderCell>Labeling</Table.HeaderCell>
                            <Table.HeaderCell>Collection</Table.HeaderCell>
                            <Table.HeaderCell>Tomography</Table.HeaderCell>
                            <Table.HeaderCell>Neurons</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan={3}>
                                {totalCount >= 0 ? (totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} samples` : "There are no samples") : ""}
                            </Table.HeaderCell>
                            <Table.HeaderCell colSpan={3} textAlign="center">
                                <i>Click a value to edit.</i>
                            </Table.HeaderCell>
                            <Table.HeaderCell colSpan={3} textAlign="right">
                            {`Page ${activePage} of ${pageCount}`}
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            </Segment.Group>
        </div>
    )
}
