import * as React from "react";
import {useEffect, useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Form, Grid, Header, Icon, Input, Message, Placeholder, PlaceholderHeader, PlaceholderLine, Segment, TextArea} from "semantic-ui-react";
import {toast} from "react-toastify";

import {ICollection} from "../../models/collection";
import {CREATE_COLLECTION_MUTATION, MutateCollectionOutput, MutateCollectionVariables, UPDATE_COLLECTION_MUTATION} from "../../graphql/collections";
import {toastCreateError, toastUpdateSuccess} from "../common/Toasts";

type EditCollectionProps = {
    collection?: ICollection;

    afterCreate?(): void;
}

export const EditCollection = (props: EditCollectionProps) => {
    const [state, setState] = useState({
        name: props.collection?.name ?? "",
        description: props.collection?.description ?? "",
        reference: props.collection?.reference ?? ""
    });

    useEffect(() => {
        setState({
            name: props.collection?.name ?? "",
            description: props.collection?.description ?? "",
            reference: props.collection?.reference ?? ""
        })
    }, [props.collection]);

    const [createReconstruction, {data: createData}] = useMutation<MutateCollectionOutput, MutateCollectionVariables>(CREATE_COLLECTION_MUTATION,
        {
            refetchQueries: ["CollectionsQuery"],
            onCompleted: (data) => {
                toast.success(toastUpdateSuccess());
                if (props.afterCreate) {
                    props.afterCreate();
                }
            },
            onError: (error) => toast.error(toastCreateError(error), {autoClose: false})
        });

    const [updateReconstruction, {data: updateData}] = useMutation<MutateCollectionOutput, MutateCollectionVariables>(UPDATE_COLLECTION_MUTATION,
        {
            refetchQueries: ["CollectionsQuery"],
            onCompleted: (data) => toast.success(toastUpdateSuccess()),
            onError: (error) => toast.error(toastCreateError(error), {autoClose: false})
        });

    if (props.collection == null) {
        return <NoCollection/>
    }

    const updateName = (value: string) => setState({...state, name: value});
    const updateDescription = (value: string) => setState({...state, description: value});
    const updateReference = (value: string) => setState({...state, reference: value});

    const canUpdate = state.name.length > 0;

    const onCreateOrUpdate = async () => {
        if (props.collection?.id != null) {
            await updateReconstruction({variables: {collection: {...state, id: props.collection.id}}});
        } else {
            await createReconstruction({variables: {collection: state}});
        }
    };

    const createWarning = props.collection?.id == null ?
        <Message attached="bottom" warning><Icon name="warning sign"/>Collections currently can not be removed once added.</Message> : null;

    const updateNameWarning = props.collection?.id != null && state.name != props.collection.name ?
        <Message attached="bottom" warning><Icon name="warning sign"/>Modifying the collection name may have downstream impacts.</Message> : null;

    return (
        <Segment.Group>
            <Segment secondary>
                <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
                    <Header style={{margin: 0, marginTop: "6px", verticalAlign: "middle"}}>Collection Information</Header>
                    <div style={{order: 2, flexGrow: 1, flexShrink: 1}}/>
                    <div style={{order: 3, flexGrow: 0, flexShrink: 0, marginRight: "12px"}}>
                        <Button size="tiny" color={props.collection?.id != null ? "green" : "blue"} disabled={!canUpdate} onClick={onCreateOrUpdate}>
                            {props.collection?.id != null ? "Update" : "Create"}
                        </Button>
                    </div>
                </div>
            </Segment>
            <Segment>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <Form>
                                <Form.Field>
                                    <label>Name</label>
                                    <Input placeholder='Enter name...' value={state.name} onChange={(e, {name, value}) => updateName(value)}/>
                                </Form.Field>
                            </Form>
                        </Grid.Column>
                        <Grid.Column width={8}>
                            <Form>
                                <Form.Field>
                                    <label>Reference</label>
                                    <Input placeholder='Enter reference...' value={state.reference} onChange={(e, {name, value}) => updateReference(value)}/>
                                </Form.Field>
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column width={16}>
                            <Form>
                                <Form.Field>
                                    <label>Description</label>
                                </Form.Field>
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row style={{paddingTop: 0}}>
                        <Grid.Column width={16}>
                            <Form>
                                <TextArea placeholder="Enter description..." value={state.description}
                                          onChange={(e, {name, value}) => updateDescription(value.toString())}/>
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
            {createWarning}
            {updateNameWarning}
        </Segment.Group>
    )
}

const NoCollection = () => (
    <Segment>
        <h5><Icon name="info circle"/>Select a collection from the table to edit</h5>
        <Placeholder>
            <PlaceholderHeader image>
                <PlaceholderLine/>
                <PlaceholderLine/>
            </PlaceholderHeader>
        </Placeholder>
    </Segment>
);
