import React from "react";
import {useMutation} from "@apollo/client";
import {Button, Group, Modal, Stack, Text} from "@mantine/core";

import {
    API_KEYS_QUERY,
    ApiKeyShape,
    DELETE_API_KEY_MUTATION,
    DeleteApiKeyResponse,
    DeleteApiKeyVariables,
} from "../../../graphql/apiKey";
import {errorNotification, successNotification} from "../../common/NotificationHelper";

type RevokeApiKeyModalProps = {
    show: boolean;
    apiKey: ApiKeyShape;
    onClose(): void;
}

export const RevokeApiKeyModal = (props: RevokeApiKeyModalProps) => {
    const [revokeApiKey, {loading}] = useMutation<DeleteApiKeyResponse, DeleteApiKeyVariables>(DELETE_API_KEY_MUTATION, {
        refetchQueries: [API_KEYS_QUERY],
        onCompleted: (data) => {
            if (data.deleteApiKey) {
                successNotification("API Key", "The API key was successfully revoked");
            } else {
                errorNotification("API Key", "The API key could not be found");
            }
        },
        onError: (e) => errorNotification("API Key", e.message)
    });

    const onRevokeClick = async () => {
        await revokeApiKey({variables: {id: props.apiKey.id}});
        props.onClose();
    };

    return (
        <Modal.Root opened={props.show} onClose={props.onClose} size="md" centered>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>Revoke API Key</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack m={0} p={12}>
                        <Text>Are you sure you want to revoke this API key?</Text>
                        <Text size="sm" c="dimmed">{props.apiKey?.description}</Text>
                        <Group justify="flex-end">
                            <Button variant="outline" onClick={props.onClose}>Cancel</Button>
                            <Button color="red" loading={loading} onClick={onRevokeClick}>Revoke</Button>
                        </Group>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
