import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Alert, Button, Card, Divider, Group, Stack, Text, TextInput} from "@mantine/core";

import {CollectionShape} from "../../../models/collection";
import {
    COLLECTIONS_QUERY,
    CREATE_COLLECTION_MUTATION, CreateCollectionOutput,
    MutateCollectionVariables,
    UPDATE_COLLECTION_MUTATION, UpdateCollectionOutput
} from "../../../graphql/collection";
import {toastCreateError, toastCreateSuccess, toastUpdateSuccess} from "../../common/NotificationHelper";
import {IconInfoCircle} from "@tabler/icons-react";

export const EditCollection = ({collection}: { collection: CollectionShape }) => {
    const [state, setState] = useState({
        name: collection?.name ?? "",
        description: collection?.description ?? "",
        reference: collection?.reference ?? ""
    });

    const [createReconstruction] = useMutation<CreateCollectionOutput, MutateCollectionVariables>(CREATE_COLLECTION_MUTATION,
        {
            refetchQueries: [COLLECTIONS_QUERY],
            onCompleted: () => {
                toastCreateSuccess("The collection was created.");
            },
            onError: (error) => toastCreateError(error)
        });

    const [updateReconstruction] = useMutation<UpdateCollectionOutput, MutateCollectionVariables>(UPDATE_COLLECTION_MUTATION,
        {
            refetchQueries: [COLLECTIONS_QUERY],
            onCompleted: () => toastUpdateSuccess("The collection was updated."),
            onError: (error) => toastCreateError(error)
        });

    const updateName = (value: string) => setState({...state, name: value});
    const updateDescription = (value: string) => setState({...state, description: value});
    const updateReference = (value: string) => setState({...state, reference: value});

    const canUpdate = state.name.length > 0 && (state.name != collection.name || state.description != collection.description || state.reference != collection.reference);

    const onCreateOrUpdate = async () => {
        if (collection?.id != null) {
            await updateReconstruction({variables: {collection: {...state, id: collection.id}}});
        } else {
            await createReconstruction({variables: {collection: state}});
        }
    };

    /*
    const createWarning = collection?.id == null ?
        <Message attached="bottom" warning><Icon name="warning sign"/>Collections currently can not be removed once added.</Message> : null;
*/
    const updateNameWarning = collection?.id != null && state.name != collection.name ?
        <Alert mah={60} m={0} p={12} variant="light" color="yellow" icon={<IconInfoCircle size={22}/>}>Note: Modifying the collection name may have downstream
            impacts.</Alert> : null;

    return (
        <Card key={collection.id} withBorder>
            <Card.Section bg="segment">
                <Group p={12} mih={72} justify="space-between">
                    <Group gap="sm">
                        <Text fw={500}>{collection.name}</Text>
                    </Group>
                    <Group>
                        {updateNameWarning}
                        <Button size="tiny" disabled={!canUpdate} onClick={onCreateOrUpdate}>
                            Update
                        </Button>
                    </Group>
                </Group>
                <Divider orientation="horizontal"/>
            </Card.Section>
            <Card.Section bg="segment">
                <Stack p={12}>
                    <TextInput label="Name" value={state.name} onChange={e => updateName(e.currentTarget.value)}/>
                    <TextInput label="Reference" value={state.reference} onChange={e => updateReference(e.currentTarget.value)}/>
                    <TextInput label="Description" value={state.description} onChange={e => updateDescription(e.currentTarget.value)}/>
                </Stack>
            </Card.Section>
        </Card>
    );
}
