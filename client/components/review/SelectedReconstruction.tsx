import * as React from "react";
import {useContext, useState} from "react";
import {useMutation} from "@apollo/react-hooks";
import {Button, Grid, GridRow, Header, Icon, Placeholder, PlaceholderHeader, PlaceholderLine, Segment} from "semantic-ui-react";
import {toast} from "react-toastify";

import {IReconstruction} from "../../models/reconstruction";
import {CreateTracing} from "./upload/CreateTracing";
import {ConstantsContext} from "../app/AppConstants";
import {CompleteReconstructionPanel} from "../reconstructions/CompleteReconstructionPanel";
import {UPDATE_RECONSTRUCTION_MUTATION, UpdateReconstructionResponse, UpdateReconstructionVariables} from "../../graphql/reconstruction";
import {toastCreateError, toastUpdateSuccess} from "../editors/Toasts";

export type SelectedReconstructionProps = {
    reconstruction: IReconstruction;
}

export const SelectedReconstruction = (props: SelectedReconstructionProps) => {
    if (props.reconstruction == null) {
        return <NoSelectedReconstruction/>
    }

    const constants = useContext(ConstantsContext);

    const [state, setState] = useState({
        duration: props.reconstruction.durationHours.toString(),
        length: props.reconstruction.lengthMillimeters.toString(),
        notes: props.reconstruction.notes,
        checks: props.reconstruction.checks,
    })

    const [updateReconstruction, {data: completeData}] = useMutation<UpdateReconstructionResponse, UpdateReconstructionVariables>(UPDATE_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: ["ReconstructionsQuery"],
            onCompleted: (data) => toast.success(toastUpdateSuccess()),
            onError: (error) => toast.error(toastCreateError(error), {autoClose: false})
        });

    const updateDuration = (value: string) => setState({...state, duration: value});
    const updateLength = (value: string) => setState({...state, length: value});
    const updateNotes = (value: string) => setState({...state, notes: value});
    const updateChecks = (value: string) => setState({...state, checks: value});

    const canUpdate = (state.duration.trim().length == 0 || !isNaN(parseFloat(state.duration))) &&
        (state.length.trim().length == 0 || !isNaN(parseFloat(state.length)));

    const onUpdateReconstruction = async () => {
        const duration = state.duration.trim().length == 0 ? 0 : parseFloat(state.duration);
        const length = state.length.trim().length == 0 ? 0 : parseFloat(state.length);

        await updateReconstruction({variables: {id: props.reconstruction.id, duration: duration, length: length, notes: state.notes, checks: state.checks}});
    }

    const axonIcon = props.reconstruction.axon ? <Icon name="check" color="green"/> : <Icon name="attention" color="red"/>
    const dendriteIcon = props.reconstruction.dendrite ? <Icon name="check" color="green"/> : <Icon name="attention" color="red"/>

    return (
        <Grid fluid="true">
            <Grid.Row style={{paddingBottom: 10}}>
                <Grid.Column width={8}>
                    <CreateTracing neuron={props.reconstruction.neuron} tracingStructures={constants.TracingStructures}/>
                </Grid.Column>
                <Grid.Column width={8}>
                    <Segment.Group>
                        <Segment secondary>
                            <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
                                <Header style={{margin: 0, marginTop: "6px", verticalAlign: "middle"}}>Reconstruction Metadata</Header>
                                <div style={{order: 2, flexGrow: 1, flexShrink: 1}}/>
                                <div style={{order: 3, flexGrow: 0, flexShrink: 0, marginRight: "12px"}}>
                                    <Button size="tiny" color="blue" disabled={!canUpdate} onClick={onUpdateReconstruction}>Update</Button>
                                </div>
                            </div>
                        </Segment>
                        <Segment>
                            <Grid columns={2}>
                                <GridRow>
                                    <Grid.Column>
                                        <Header as="h5">Axon Source</Header>
                                        {axonIcon}{props.reconstruction.axon ? props.reconstruction.axon.filename : "(requires upload)"}
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Header as="h5">Dendrite Source</Header>
                                        {dendriteIcon}{props.reconstruction.dendrite ? props.reconstruction.dendrite.filename : "(requires upload)"}
                                    </Grid.Column>
                                </GridRow>
                            </Grid>
                            <CompleteReconstructionPanel id={props.reconstruction.id} data={state} updateChecks={updateChecks} updateLength={updateLength}
                                                         updateNotes={updateNotes} updateDuration={updateDuration}/>
                        </Segment>
                    </Segment.Group>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

const NoSelectedReconstruction = () => (
    <Segment>
        <h5><Icon name="info circle"/>Select a reconstruction from the table to review and upload the reconstruction data.</h5>
        <Placeholder>
            <PlaceholderHeader image>
                <PlaceholderLine/>
                <PlaceholderLine/>
            </PlaceholderHeader>
        </Placeholder>
    </Segment>
);
