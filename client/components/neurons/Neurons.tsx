import * as React from "react";
import {useEffect, useState} from "react";
import {Button, Dropdown, Segment, Grid, Confirm, Table, Header} from "semantic-ui-react";
import {toast} from "react-toastify";

import {toastCreateError, toastDeleteError} from "../editors/Toasts";
import {PaginationHeader} from "../editors/PaginationHeader";
import {
    CREATE_NEURON_MUTATION,
    CreateNeuronMutationData,
    DELETE_NEURON_MUTATION,
    NEURONS_QUERY, NeuronsQueryResponse, NeuronsQueryVariables
} from "../../graphql/neuron";
import {displaySample, ISample} from "../../models/sample";
import {NeuronsTable} from "./NeuronsTable";
import {displayNeuron, INeuron} from "../../models/neuron";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {UserPreferences} from "../../util/userPreferences";

interface INeuronsProps {
    samples: ISample[];
}

interface INeuronsState {
    offset?: number;
    limit?: number;
    sample?: ISample;
    isSampleLocked?: boolean;
    requestedNeuronForDelete?: INeuron;
    requestedNeuronForAnnotations?: INeuron;
}

export const Neurons = (props: INeuronsProps) => {
    let sample: ISample = null;
    let isSampleLocked = false;

    if (UserPreferences.Instance.neuronCreateLockedSampleId.length > 0) {
        sample = props.samples.find(s => s.id === UserPreferences.Instance.neuronCreateLockedSampleId) || null;
        isSampleLocked = sample != null;
    }

    const [state, setState] = useState<INeuronsState>({
        offset: UserPreferences.Instance.neuronPageOffset,
        limit: UserPreferences.Instance.neuronPageLimit,
        sample,
        isSampleLocked,
        requestedNeuronForDelete: null,
        requestedNeuronForAnnotations: null
    });

    useEffect(() => {
        const lockedSampleId = UserPreferences.Instance.neuronCreateLockedSampleId;

        let sample = state.sample;

        if (lockedSampleId) {
            sample = props.samples.find((s: ISample) => s.id === lockedSampleId);
        } else if (state.sample) {
            sample = props.samples.find((s: ISample) => s.id === sample.id);
        }

        if (sample) {
            setState({...state, sample: sample, isSampleLocked: lockedSampleId.length > 0});
        } else {
            setState({...state, sample: null, isSampleLocked: false});
        }
    }, ["sample", "isSampleLocked"])

    const [deleteNeuron] = useMutation(DELETE_NEURON_MUTATION,
        {
            refetchQueries: ["NeuronsQuery"],
            onError: (error) => toast.error(toastDeleteError(error), {autoClose: false})
        });

    const [createNeuron] = useMutation(CREATE_NEURON_MUTATION,
        {
            refetchQueries: ["NeuronsQuery"],
            onCompleted: (data) => onNeuronCreated(data.createNeuron),
            onError: (error) => toast.error(toastCreateError(error), {autoClose: false})
        });

    const {loading, error, data} = useQuery<NeuronsQueryResponse, NeuronsQueryVariables>(NEURONS_QUERY,
        {
            pollInterval: 10000,
            variables: {input: {offset: state.offset, limit: state.limit, sortOrder: "DESC"}}
        });

    const onUpdateOffsetForPage = (page: number) => {
        const offset = state.limit * (page - 1);

        if (offset !== state.offset) {
            setState({...state, offset});

            UserPreferences.Instance.neuronPageOffset = offset;
        }
    };

    const onUpdateLimit = (limit: number) => {
        if (limit !== state.limit) {
            let offset = state.offset;

            if (offset < limit) {
                offset = 0;
            }

            setState({...state, offset, limit});

            UserPreferences.Instance.neuronPageOffset = offset;
            UserPreferences.Instance.neuronPageLimit = limit;
        }
    };

    const onSampleChange = (sampleId: string) => {
        if (!state.sample || sampleId !== state.sample.id) {
            setState({...state, sample: props.samples.find(s => s.id === sampleId) || null});
        }
    }

    const onLockSample = () => {
        // Based on current state so if locked, clear locked sample, etc.
        UserPreferences.Instance.neuronCreateLockedSampleId = state.isSampleLocked ? "" : state.sample.id;

        setState({...state, isSampleLocked: !state.isSampleLocked});
    }

    const renderCreateNeuron = () => {
        const items = props.samples.map(s => {
            return {value: s.id, text: displaySample(s)}
        });

        return (
            <Table style={{
                border: "none",
                background: "transparent",
                marginTop: 0,
                maxWidth: "480px",
                textAlign: "right"
            }}>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell style={{padding: 0, width: "300px"}}>
                            <Button as="div" fluid labelPosition="left">
                                <Dropdown search fluid selection options={items}
                                          className="label"
                                          placeholder="Select sample..."
                                          disabled={state.isSampleLocked || props.samples.length === 0}
                                          value={state.sample ? state.sample.id : null}
                                          onChange={(_, {value}) => onSampleChange(value as string)}
                                          style={{fontWeight: "normal"}}/>
                                <Button compact icon="lock" color={state.isSampleLocked ? "red" : null}
                                        disabled={state.sample === null}
                                        active={state.isSampleLocked}
                                        onClick={() => onLockSample()}/>
                            </Button>
                        </Table.Cell>

                        <Table.Cell style={{padding: 0}}>
                            <Button content="Add" icon="add" size="small" labelPosition="right" color="blue"
                                    disabled={state.sample === null}
                                    onClick={() => createNeuron({variables: {neuron: {sampleId: state.sample.id}}})}/>
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        );
    }

    const renderDeleteConfirmationModal = () => {
        if (!state.requestedNeuronForDelete) {
            return null;
        }

        return <Confirm open={true} dimmer="blurring"
                        header="Delete Neuron?"
                        content={`Are you sure you want to delete the neuron ${displayNeuron(state.requestedNeuronForDelete)}?  This action can not be undone.`}
                        confirmButton="Delete"
                        onCancel={() => setState({...state, requestedNeuronForDelete: null})}
                        onConfirm={async () => {
                            await deleteNeuron({variables: {id: state.requestedNeuronForDelete.id}});
                            setState({...state, requestedNeuronForDelete: null});
                        }}/>
    }

    if (error || loading) {
        return null
    }

    const totalCount = data.neurons ? data.neurons.totalCount : 0;

    const pageCount = Math.ceil(totalCount / state.limit);

    const activePage = state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1;

    const start = state.offset + 1;
    const end = Math.min(state.offset + state.limit, totalCount);

    return (
        <div>
            {renderDeleteConfirmationModal()}
            <Segment.Group>
                <Segment secondary style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <Header content="Neurons" style={{margin: "0"}}/>
                    {renderCreateNeuron()}
                </Segment>
                <Segment>
                    <PaginationHeader pageCount={pageCount} activePage={activePage}
                                      limit={state.limit}
                                      onUpdateLimitForPage={onUpdateLimit}
                                      onUpdateOffsetForPage={onUpdateOffsetForPage}/>
                </Segment>
                <NeuronsTable neurons={data.neurons ? data.neurons.items : []} pageCount={pageCount} activePage={activePage} start={start} end={end}
                              totalCount={totalCount} onDeleteNeuron={(n) => setState({...state, requestedNeuronForDelete: n})}
                              onManageNeuronAnnotations={(n) => setState({...state, requestedNeuronForAnnotations: n})}/>
            </Segment.Group>
        </div>
    );
}

function onNeuronCreated(data: CreateNeuronMutationData) {
    if (!data.source || data.error) {
        toast.error(toastCreateError(data.error), {autoClose: false});
    }
}
