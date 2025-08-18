import * as React from "react";
import {useContext, useEffect, useState} from "react";
import {DocumentNode, useMutation} from "@apollo/client";
import {
    Button,
    Grid,
    GridRow,
    Header,
    Icon,
    Label,
    Placeholder,
    PlaceholderHeader,
    PlaceholderLine,
    Segment
} from "semantic-ui-react";
import {toast} from "react-toastify";

import {IReconstruction} from "../../models/reconstruction";
import {CreateTracing} from "./upload/CreateTracing";
import {ConstantsContext} from "../app/AppConstants";
import {RequestReviewPanel} from "../reconstructions/RequestReviewPanel";
import {
    UPDATE_RECONSTRUCTION_MUTATION,
    UpdateReconstructionResponse,
    UpdateReconstructionVariables
} from "../../graphql/reconstruction";
import {toastCreateError, toastUpdateSuccess} from "../editors/Toasts";

export type SelectedReconstructionProps = {
    reconstruction: IReconstruction;
    nameModifier?: string;
    mutation: DocumentNode;
    refetchQueries: string[];
}

export const SelectedReconstruction: React.FC<SelectedReconstructionProps> = ({reconstruction = null, nameModifier = "", mutation, refetchQueries}) => {
    if (reconstruction == null) {
        return <NoSelectedReconstruction nameModifier={nameModifier}/>
    }

    const constants = useContext(ConstantsContext);

    const [state, setState] = useState({
        duration: reconstruction.durationHours.toString(),
        length: reconstruction.lengthMillimeters.toString(),
        notes: reconstruction.notes,
        checks: reconstruction.checks,
    })

    useEffect(() => {
        setState({
            duration: reconstruction.durationHours.toString(),
            length: reconstruction.lengthMillimeters.toString(),
            notes: reconstruction.notes,
            checks: reconstruction.checks,
        })
    }, [reconstruction]);

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

        await updateReconstruction({
            variables: {
                id: reconstruction.id,
                duration: duration,
                length: length,
                notes: state.notes,
                checks: state.checks
            }
        });
    }

    const axonIcon = reconstruction.axon ? <Icon name="check" color="green"/> :
        <Icon name="attention" color="red"/>
    const dendriteIcon = reconstruction.dendrite ? <Icon name="check" color="green"/> :
        <Icon name="attention" color="red"/>

    return (
        <Grid fluid="true">
            <Grid.Row style={{paddingBottom: 10}}>
                <Grid.Column width={8}>
                    <CreateTracing reconstruction={reconstruction} elementName={`create-view-container-${nameModifier.toLowerCase()}`} mutation={mutation} refetchQueries={refetchQueries}/>
                </Grid.Column>
                <Grid.Column width={8}>
                    <Segment.Group>
                        <Segment secondary>
                            <div style={{display: "flex", flexDirection: "row"}}>
                                <Header style={{margin: 0, marginTop: "6px", verticalAlign: "middle"}}>{nameModifier}Reconstruction Metadata</Header>
                                <div style={{order: 2, flexGrow: 1, flexShrink: 1}}/>
                                <div style={{order: 3, flexGrow: 0, flexShrink: 0, marginRight: "12px"}}>
                                    <Button size="tiny" color="green" disabled={!canUpdate}
                                            onClick={onUpdateReconstruction}>Update</Button>
                                </div>
                            </div>
                        </Segment>
                        <Segment>
                            <Grid columns={2}>
                                <GridRow>
                                    <Grid.Column>
                                        <Header as="h5">Axon Source</Header>
                                        {axonIcon}{reconstruction.axon ? reconstruction.axon.filename : "(requires upload)"}
                                    </Grid.Column>
                                    <Grid.Column>
                                        <Header as="h5">Dendrite Source</Header>
                                        {dendriteIcon}{reconstruction.dendrite ? reconstruction.dendrite.filename : "(requires upload)"}
                                    </Grid.Column>
                                </GridRow>
                            </Grid>
                            <RequestReviewPanel id={reconstruction.id} data={state}
                                                updateChecks={updateChecks} updateLength={updateLength}
                                                updateNotes={updateNotes} updateDuration={updateDuration}/>
                            <br/> <br/>
                            <Label>
                                <Icon name="info circle" color="blue"/>
                                {reconstruction.id}
                            </Label>
                        </Segment>
                    </Segment.Group>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    )
        ;
}


const NoSelectedReconstruction = ({nameModifier = ""}) => {
    return (
        <Segment>
            <h5><Icon name="info circle"/>Select a reconstruction from the table to review and upload {nameModifier.toLowerCase()}reconstruction
                data.</h5>
            <Placeholder>
                <PlaceholderHeader image>
                    <PlaceholderLine/>
                    <PlaceholderLine/>
                </PlaceholderHeader>
            </Placeholder>
        </Segment>
    )
};
