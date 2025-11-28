import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {useMutation} from "@apollo/client";
import {Button, Group, Popover, Stack, Text, TextInput} from "@mantine/core";

import {AccessRequest} from "../../viewmodel/accessRequest";
import {REQUEST_ACCESS_MUTATION, RequestAccessMutationResponse, RequestAccessVariables} from "../../graphql/accessRequest";
import {RequestAccessResponse} from "../../models/accessRequest";

export const RequestAccess = observer(({onResponse}: {onResponse: (response: RequestAccessResponse) => void}) => {
    const [opened, setOpened] = useState(false);
    const [request] = useState<AccessRequest>(new AccessRequest());

    const [requestAccess] = useMutation<RequestAccessMutationResponse, RequestAccessVariables>(REQUEST_ACCESS_MUTATION);

    const onRequestAccess = async () => {
        const {data} = await requestAccess({variables: {request: request}});
        setOpened(false);
        onResponse(data.requestAccess);
    }

    return <Popover opened={opened} onChange={setOpened}>
        <Popover.Target>
            <Button variant="subtle" onClick={() => setOpened((o) => !o)}>Request access to annotate neurons</Button>
        </Popover.Target>
        <Popover.Dropdown>
            <Stack maw={400}>
                <Group justify="space-between">
                    <TextInput label="First Name" placeholder="Your first name" withAsterisk={request.firstName?.length <= 0} value={request.firstName}
                               onChange={(e) => request.firstName = e.target.value}/>
                    <TextInput label="Last Name" placeholder="Your last name" withAsterisk={request.lastName?.length <= 0} value={request.lastName}
                               onChange={(e) => request.lastName = e.target.value}/>
                </Group>
                <TextInput label="Institution" placeholder="Your Institution" withAsterisk={request.affiliation?.length <= 0} value={request.affiliation}
                           onChange={(e) => request.affiliation = e.target.value}/>
                <TextInput label="Email" placeholder="Your email" withAsterisk={!request.isValidEmailAddress} value={request.emailAddress}
                           onChange={(e) => request.emailAddress = e.target.value}/>
                <TextInput label="Proposed Use" placeholder="Please briefly describe your proposed use." withAsterisk={request.purpose?.length <= 0}
                           value={request.purpose}
                           onChange={(e) => request.purpose = e.target.value}/>
                <Text size="sm" c="dimmed">A member of the Neuron Morphology Community Portal will contact you regarding access to annotate and publish
                    reconstructions.</Text>
                <Group justify="end">
                    <Button size="small" disabled={!request.isValid} onClick={() => onRequestAccess()}>Request</Button>
                </Group>
            </Stack>
        </Popover.Dropdown>
    </Popover>
});
