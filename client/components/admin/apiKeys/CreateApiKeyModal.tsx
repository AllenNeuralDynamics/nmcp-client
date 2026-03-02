import React, {useState} from "react";
import {useMutation} from "@apollo/client";
import {Alert, Button, CopyButton, ActionIcon, Group, Modal, Select, Stack, TextInput, Tooltip} from "@mantine/core";
import {IconAlertCircle, IconCopy, IconCheck} from "@tabler/icons-react";

import {
    API_KEYS_QUERY,
    CREATE_API_KEY_MUTATION,
    CreateApiKeyResponse,
    CreateApiKeyVariables,
} from "../../../graphql/apiKey";
import {errorNotification} from "../../common/NotificationHelper";
import {randomBytes, toBase64Url} from "../../../util/crypto";

type CreateApiKeyModalProps = {
    show: boolean;
    onClose(): void;
}

function generateApiKey(): string {
    return "nmcp_" + toBase64Url(randomBytes(32));
}

export const CreateApiKeyModal = (props: CreateApiKeyModalProps) => {
    const [description, setDescription] = useState<string>("");
    const [durationDays, setDurationDays] = useState<string>("90");
    const [createdKey, setCreatedKey] = useState<string>(null);

    const [createApiKey, {loading}] = useMutation<CreateApiKeyResponse, CreateApiKeyVariables>(CREATE_API_KEY_MUTATION, {
        refetchQueries: [API_KEYS_QUERY],
        onError: (e) => errorNotification("API Key", e.message)
    });

    const onCreateClick = async () => {
        const key = generateApiKey();
        const result = await createApiKey({variables: {key, description, durationDays: parseInt(durationDays)}});
        if (result.data?.createApiKey) {
            setCreatedKey(key);
        }
    };

    const onClose = () => {
        setDescription("");
        setDurationDays("90");
        setCreatedKey(null);
        props.onClose();
    };

    if (createdKey) {
        return (
            <Modal.Root opened={props.show} onClose={onClose} size="lg" centered>
                <Modal.Overlay/>
                <Modal.Content>
                    <Modal.Header bg="segment">
                        <Modal.Title>API Key Created</Modal.Title>
                        <Modal.CloseButton/>
                    </Modal.Header>
                    <Modal.Body p={0}>
                        <Stack m={0} p={12}>
                            <Alert icon={<IconAlertCircle size={20}/>} color="yellow">
                                Make sure to copy your API key now as you will not be able to see this again.
                            </Alert>
                            <TextInput readOnly value={createdKey}
                                       rightSection={
                                           <CopyButton value={createdKey} timeout={2000}>
                                               {({copied, copy}) => (
                                                   <Tooltip label={copied ? "Copied" : "Copy"} withArrow>
                                                       <ActionIcon color={copied ? "teal" : "gray"} variant="subtle"
                                                                   onClick={copy}>
                                                           {copied ? <IconCheck size={16}/> : <IconCopy size={16}/>}
                                                       </ActionIcon>
                                                   </Tooltip>
                                               )}
                                           </CopyButton>
                                       }/>
                            <Group justify="flex-end">
                                <Button onClick={onClose}>Done</Button>
                            </Group>
                        </Stack>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        );
    }

    return (
        <Modal.Root opened={props.show} onClose={onClose} size="md" centered>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>Create API Key</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack m={0} p={12}>
                        <TextInput label="Description" placeholder="Enter a description for this key..."
                                   value={description}
                                   onChange={(e) => setDescription(e.currentTarget.value)}/>
                        <Select label="Duration" data={[
                            {value: "7", label: "7 days"},
                            {value: "30", label: "30 days"},
                            {value: "60", label: "60 days"},
                            {value: "90", label: "90 days"},
                        ]} value={durationDays} onChange={setDurationDays} allowDeselect={false}/>
                        <Group justify="flex-end">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button loading={loading} disabled={description.length === 0}
                                    onClick={onCreateClick}>Create</Button>
                        </Group>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
