import * as React from "react";
import {useState} from "react";
import {useIsAuthenticated} from "@azure/msal-react";
import {Card, Divider, Group, List, Loader, Stack, Text} from "@mantine/core";

import {useUser} from "../../hooks/useUser";
import {UserPermissions} from "../../graphql/user";
import {hasPermission} from "../../models/user";
import {RequestAccessResponse} from "../../models/accessRequest";
import {ContactPortalForm, contactPortalResponseMessage, RequestAccessForm, requestAccessResponseMessage} from "../common/RequestAccess";
import {MessageBox} from "../common/MessageBox";

const authorizations: [UserPermissions, string][] = [
    [UserPermissions.AnnotateAll, "Annotation"],
    [UserPermissions.PeerReview, "Peer Review"],
    [UserPermissions.TeamReview, "Team Review"],
    [UserPermissions.PublishReview, "Publish Review"],
    [UserPermissions.Edit, "Manage Specimens and Neurons"],
    [UserPermissions.Admin, "Administration"]
];

// hasPermission treats Admin as holding every permission, so an administrator is listed as authorized for everything.
export function authorizationLabels(permissions: number): string[] {
    return authorizations.filter(([bits]) => hasPermission(permissions, bits)).map(([, label]) => label);
}

const Authorizations = () => {
    const user = useUser();

    if (!user) {
        return <Loader size="sm"/>;
    }

    const labels = authorizationLabels(user.permissions);

    if (labels.length === 0) {
        return <Text size="sm">You are not yet authorized for any portal activities.</Text>;
    }

    return (
        <Stack gap="xs">
            <Text size="sm">You are authorized for</Text>
            <List size="sm">
                {labels.map(label => <List.Item key={label}>{label}</List.Item>)}
            </List>
        </Stack>
    );
}

const AccessRequest = () => {
    const [message, setMessage] = useState<string>(null);

    return (
        <>
            <RequestAccessForm wide onResponse={(response: RequestAccessResponse) => setMessage(requestAccessResponseMessage(response))}/>
            {message ? <MessageBox message={message} opened={true} centered={true} cancellable={false} title="Access Request"
                                   onConfirm={() => setMessage(null)}/> : null}
        </>
    );
}

const ContactPortal = () => {
    const [message, setMessage] = useState<string>(null);

    return (
        <>
            <ContactPortalForm wide onResponse={(response: RequestAccessResponse) => setMessage(contactPortalResponseMessage(response))}/>
            {message ? <MessageBox message={message} opened={true} centered={true} cancellable={false} title="Contact Portal Team"
                                   onConfirm={() => setMessage(null)}/> : null}
        </>
    );
}

const SupportCard = ({title, children}: { title: string, children: React.ReactNode }) => {
    return (
        <Card withBorder>
            <Card.Section bg="segment">
                <Group p={12}>
                    <Text size="lg" fw={500}>{title}</Text>
                </Group>
                <Divider orientation="horizontal"/>
            </Card.Section>
            <Card.Section p={12}>
                {children}
            </Card.Section>
        </Card>
    );
}

export const Support = () => {
    const isAuthenticated = useIsAuthenticated();

    return (
        <Stack m={20}>
            <SupportCard title="Documentation">
                <Text size="sm">Neuron Morphology Community Portal documentation coming soon.</Text>
            </SupportCard>
            {isAuthenticated ? (
                <SupportCard title="Access">
                    <Authorizations/>
                </SupportCard>
            ) : (
                <SupportCard title="Request Access">
                    <AccessRequest/>
                </SupportCard>
            )}
            <SupportCard title="Contact Portal Team">
                <ContactPortal/>
            </SupportCard>
        </Stack>
    );
}
