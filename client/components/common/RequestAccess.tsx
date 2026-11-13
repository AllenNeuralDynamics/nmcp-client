import * as React from "react";
import {useEffect, useState} from "react";
import {useMutation} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {useIsAuthenticated} from "@azure/msal-react";
import {Button, Group, Popover, Stack, Text, Textarea, TextInput} from "@mantine/core";

import {AccessRequest} from "../../viewmodel/accessRequest";
import {REQUEST_ACCESS_MUTATION, RequestAccessMutationResponse, RequestAccessVariables} from "../../graphql/accessRequest";
import {AccessRequestKind, RequestAccessResponse} from "../../models/accessRequest";
import {useUser} from "../../hooks/useUser";

const ThrottledMessage = "There have been too many requests from your location in a short period of time.  Please try again later.";

const NotSentMessage = "There was a problem sending this to the Neuron Morphology Community Portal team.  Please try again later.";

export function requestAccessResponseMessage(response: RequestAccessResponse): string {
    switch (response) {
        case RequestAccessResponse.Throttled:
            return ThrottledMessage;
        case RequestAccessResponse.DuplicateApproved:
        case RequestAccessResponse.DuplicateDenied:
        case RequestAccessResponse.DuplicateOpen:
            return "Access has already been requested for this email address.  If you have not yet received a response, a member of the Neuron Morphology" +
                " Community Portal team will be in contact as soon as your request can be processed.";
        case RequestAccessResponse.Accepted:
            return "The request for access has been received.  A member of the Neuron Morphology Community Portal team will be in contact.";
        default:
            return NotSentMessage;
    }
}

export function contactPortalResponseMessage(response: RequestAccessResponse): string {
    switch (response) {
        case RequestAccessResponse.Throttled:
            return ThrottledMessage;
        case RequestAccessResponse.TooManyOpenFeedback:
            return "The limit on messages awaiting a response has been reached for this email address.  A member of the Neuron Morphology " +
                "Community Portal team will follow up with you on the ones already sent, after which you can send more.";
        case RequestAccessResponse.Accepted:
            return "Your message has been received.  A member of the Neuron Morphology Community Portal team will follow up with you.";
        default:
            return NotSentMessage;
    }
}

type SubmissionText = {
    kind: AccessRequestKind;
    purposeLabel: string;
    purposePlaceholder: string;
    infoText: string;
    submitLabel: string;
}

const AccessRequestText: SubmissionText = {
    kind: AccessRequestKind.Access,
    purposeLabel: "Proposed Use",
    purposePlaceholder: "Please describe your scientific area of interest and how analysis of single neuron morphologies fit in your research plan. Include your brain area(s) of interest and the proposed scope of your proofreading effort (e.g., approximate number of brain areas and neurons).",
    infoText: "A member of the Neuron Morphology Community Portal team will contact you regarding access to annotate and publish reconstructions in the portal. Before new users are granted access, they must attend a portal training webinar. Once access is granted, users are expected to actively engage with the portal user community including sharing progress updates on neuron annotations they have completed for their project.",
    submitLabel: "Request"
};

const ContactPortalText: SubmissionText = {
    kind: AccessRequestKind.Feedback,
    purposeLabel: "Message",
    purposePlaceholder: "Contact the portal team about questions or issues.",
    infoText: "A member of the Neuron Morphology Community Portal team will follow up with you.",
    submitLabel: "Send Message"
};

type SubmissionFormProps = {
    onResponse: (response: RequestAccessResponse) => void;
    wide?: boolean;
}

const SubmissionForm = observer(({text, onResponse, wide = false}: SubmissionFormProps & { text: SubmissionText }) => {
    const [request] = useState<AccessRequest>(() => new AccessRequest(text.kind));

    // A signed-out visitor still gets a user from the API, its anonymous placeholder, whose name must not be offered as theirs.
    const isAuthenticated = useIsAuthenticated();

    const loadedUser = useUser();

    const user = isAuthenticated ? loadedUser : null;

    useEffect(() => {
        if (user) {
            request.fillBlanksFrom(user);
        }
    }, [user]);

    const [requestAccess, {loading}] = useMutation<RequestAccessMutationResponse, RequestAccessVariables>(REQUEST_ACCESS_MUTATION);

    const onSubmit = async () => {
        let response: RequestAccessResponse;

        // A call that fails stores nothing, so it is reported the same way as the API refusing the submission as invalid.
        try {
            const {data} = await requestAccess({variables: {request: request}});

            response = data?.requestAccess ?? RequestAccessResponse.Invalid;
        } catch {
            response = RequestAccessResponse.Invalid;
        }

        // Anything short of acceptance (a duplicate, throttling, a failure) leaves the entries in place for the user to see or retry.
        if (response === RequestAccessResponse.Accepted) {
            request.clear();

            if (user) {
                request.fillBlanksFrom(user);
            }
        }

        onResponse(response);
    }

    // In the wide layout each field grows from a common basis, so the four share a line when there is room and wrap evenly when there isn't.
    const fieldStyle = wide ? {flex: "1 1 220px"} : undefined;

    const firstName = <TextInput label="First Name" placeholder="Your first name" withAsterisk={request.firstName?.length <= 0} value={request.firstName}
                                 style={fieldStyle} onChange={(e) => request.firstName = e.target.value}/>;
    const lastName = <TextInput label="Last Name" placeholder="Your last name" withAsterisk={request.lastName?.length <= 0} value={request.lastName}
                                style={fieldStyle} onChange={(e) => request.lastName = e.target.value}/>;
    const institution = <TextInput label="Institution" placeholder="Your Institution" withAsterisk={request.affiliation?.length <= 0} value={request.affiliation}
                                   style={fieldStyle} onChange={(e) => request.affiliation = e.target.value}/>;
    const email = <TextInput label="Email" placeholder="Your email" withAsterisk={!request.isValidEmailAddress} value={request.emailAddress}
                             style={fieldStyle} onChange={(e) => request.emailAddress = e.target.value}/>;

    return (
        <Stack maw={wide ? undefined : 400}>
            {wide ?
                <Group align="flex-start" wrap="wrap">
                    {firstName}
                    {lastName}
                    {institution}
                    {email}
                </Group> :
                <>
                    <Group justify="space-between">
                        {firstName}
                        {lastName}
                    </Group>
                    {institution}
                    {email}
                </>}
            <Textarea label={text.purposeLabel} placeholder={text.purposePlaceholder} withAsterisk={request.purpose?.length <= 0}
                      autosize minRows={wide ? 2 : 4} maxRows={20} value={request.purpose}
                      onChange={(e) => request.purpose = e.target.value}/>
            <Text size="sm" c="dimmed">{text.infoText}</Text>
            <Group justify="end">
                <Button size="small" disabled={!request.isValid} loading={loading} onClick={() => onSubmit()}>{text.submitLabel}</Button>
            </Group>
        </Stack>
    );
});

export const RequestAccessForm = (props: SubmissionFormProps) => <SubmissionForm text={AccessRequestText} {...props}/>;

export const ContactPortalForm = (props: SubmissionFormProps) => <SubmissionForm text={ContactPortalText} {...props}/>;

export const RequestAccess = ({onResponse}: { onResponse: (response: RequestAccessResponse) => void }) => {
    const [opened, setOpened] = useState(false);

    return <Popover opened={opened} onChange={setOpened}>
        <Popover.Target>
            <Button variant="subtle" onClick={() => setOpened((o) => !o)}>Request access to annotate neurons</Button>
        </Popover.Target>
        <Popover.Dropdown>
            <RequestAccessForm onResponse={response => {
                setOpened(false);
                onResponse(response);
            }}/>
        </Popover.Dropdown>
    </Popover>
};
