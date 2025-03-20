import React, {useState} from "react"
import {useLazyQuery, useMutation, useQuery} from "@apollo/react-hooks";
import * as uuid from "uuid";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardMeta,
    Dropdown, Form, FormField, FormGroup, FormSelect,
    Icon,
    Input, Label,
    List,
    Message,
    MessageContent,
    MessageHeader
} from "semantic-ui-react"

import {UNPUBLISH_MUTATION} from "../../graphql/admin";
import {SAMPLES_QUERY, SamplesQueryResponse, SamplesQueryVariables} from "../../graphql/sample";
import {NEURONS_QUERY, NeuronsQueryResponse, NeuronsQueryVariables} from "../../graphql/neuron";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {toast} from "react-toastify";

export const Published = () => {
    const [state, setState] = useState({reconstructionId: ""});

    const [unpublish, {data, loading, error}] = useMutation(UNPUBLISH_MUTATION, {
        refetchQueries: [NEURONS_QUERY],
        onCompleted: async (data) => {
            if (data.unpublish == true) {
                toast.success((<div><h3>Unpublish</h3>The reconstruction was successfully unpublished.</div>), {autoClose: 1000});
            } else {
                toast.error((<div><h3>Unpublish</h3>There was an unknown issue unpublishing the reconstruction.</div>), {autoClose: false});
            }

            setState({reconstructionId: ""});
        }
    });

    let inProgress = null;

    if (loading) {
        inProgress = (
            <div>
                <Icon name="circle notched" loading/>
                Requesting unpublish...
            </div>
        )
    }

    return (
        <div>
            <Card.Group itemsPerRow={1}>
                <Card>
                    <CardContent>
                        <CardHeader>
                            Unpublish
                            <List floated="right">
                                <Icon name="book" size="large" color="red" floated="right"/>
                            </List>
                        </CardHeader>
                        <CardMeta>Remove a reconstruction from the published data set</CardMeta>
                        <CardDescription>
                            Unpublishing a reconstruction will remove it from the published data set and return it to an
                            "Approved" state. It will be available on the Review Reconstructions tab.
                        </CardDescription>
                        <p/>
                        <ReconstructionSelection selectedNeuron={state.reconstructionId} mutationInProgress={loading}
                                                 onSelectionChanged={(id) => setState({...state, reconstructionId: id})}/>
                        <p/>
                        <Input fluid label="Internal Id" error={!uuid.validate(state.reconstructionId)} value={state.reconstructionId} disabled={loading}
                               onChange={(e, {name, value}) => setState({...state, reconstructionId: value})}/>
                    </CardContent>
                    <CardContent extra>
                        <Form>
                            <FormGroup inline>
                                <Button negative disabled={!uuid.validate(state.reconstructionId) || loading}
                                        onClick={() => unpublish({variables: {id: state.reconstructionId}})}>
                                    Unpublish
                                </Button>
                                {inProgress}
                            </FormGroup>
                        </Form>
                    </CardContent>
                </Card>
            </Card.Group>
        </div>
    );
}

export type ReconstructionSelectionProps = {
    selectedNeuron: string;
    mutationInProgress: boolean;

    onSelectionChanged(id: string): void;
}

const ReconstructionSelection = (props: ReconstructionSelectionProps) => {
    const [state, setState] = useState({sample: null});

    const {loading: sampleLoading, error: sampleError, data: sampleData} = useQuery<SamplesQueryResponse, SamplesQueryVariables>(SAMPLES_QUERY, {
        pollInterval: 10000, variables: {input: {reconstructionStatus: ReconstructionStatus.Complete}}
    });

    const [getNeurons, {
        loading: neuronsQueryLoading,
        error: neuronsQueryError,
        data
    }] = useLazyQuery<NeuronsQueryResponse, NeuronsQueryVariables>(NEURONS_QUERY);

    const samplesLoading = sampleLoading ?
        (<Message icon>
            <Icon name='circle notched' loading/>
            <MessageContent>
                Loading samples...
            </MessageContent>
        </Message>) : null;

    const samplesError = sampleError ?
        (<Message negative icon>
            <Icon name="exclamation"/>
            <MessageContent>
                <MessageHeader>
                    {sampleError}
                </MessageHeader>
                Some Error Message
            </MessageContent>
        </Message>) : null;

    let samples = [];

    if (!samplesLoading && !sampleError) {
        samples = sampleData.samples.items.slice().sort((s1, s2) => s1.animalId < s2.animalId ? -1 : 1).map(s => {
            return {key: s.id, text: s.animalId, value: s.id}
        });
    } else {
        return (
            <div>
                {samplesLoading}
                {samplesError}
            </div>
        )
    }
    const neuronsLoading = neuronsQueryLoading ?
        (<div>
            <Icon name='circle notched' loading/>
            Loading published neurons for sample...
        </div>) : null;

    const neuronsError = neuronsQueryError ?
        (<Message negative icon>
            <Icon name="exclamation"/>
            <MessageContent>
                <MessageHeader>
                    {neuronsQueryError}
                </MessageHeader>
                Some Error Message
            </MessageContent>
        </Message>) : null;

    let neuronContent = (
        <div>
            {neuronsLoading}
            {neuronsError}
        </div>
    );

    if (!neuronsLoading && !neuronsError) {
        if (data) {
            const neurons = data.neurons.items.slice().sort((s1, s2) => s1.idString < s2.idString ? -1 : 1).map(n => {
                return {key: n.id, text: n.idString, value: n.id}
            });

            neuronContent = (
                <FormSelect disabled={props.mutationInProgress} options={neurons} value={props.selectedNeuron} placeholder="Select..."
                            onChange={(_, d) => onNeuronChanged(d.value)}/>
            )
        } else {
            neuronContent = (
                <Label pointing="left" style={{"marginTop": 6}}>Select a sample to see published neurons</Label>
            );
        }
    }

    const onSampleChanged = async (value: any) => {
        setState({...state, sample: value});

        if (value) {
            await getNeurons({variables: {input: {sampleIds: [value], reconstructionStatus: ReconstructionStatus.Complete}}})
        }
    }

    const onNeuronChanged = async (value: any) => {
        props.onSelectionChanged(value)
    }

    return (
        <div>
            <Form>
                <FormGroup widths="equal">
                    <FormField>
                        <label>Sample</label>
                        <FormSelect disabled={props.mutationInProgress} options={samples} value={state.sample} placeholder="Select..."
                                    onChange={(_, d) => onSampleChanged(d.value)}/>
                    </FormField>
                    <FormField>
                        <label>Neuron</label>
                        {neuronContent}
                    </FormField>
                </FormGroup>
            </Form>
        </div>
    )
}
