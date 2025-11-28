import * as React from "react";
import {useState} from "react";
import {useIsAuthenticated} from "@azure/msal-react";
import {useMutation} from "@apollo/client";
import {Badge, Group, Stack, Text, Tooltip} from "@mantine/core";
import {useClipboard} from "@mantine/hooks";
import {IconGitMerge} from "@tabler/icons-react";

import {useUser} from "../../hooks/useUser";
import {NeuronShape} from "../../models/neuron";
import {IssueModal} from "./IssueModal";
import {isUserReconstruction} from "../../models/reconstruction";
import {CANDIDATE_NEURONS_QUERY} from "../../graphql/candidates";
import {errorNotification} from "../common/NotificationHelper";
import {ReconstructionActionButton} from "../common/ReconstructionAction";
import {ReconstructionAction} from "../../models/reconstructionAction";
import {OPEN_RECONSTRUCTION_MUTATION, RECONSTRUCTIONS_QUERY, StartReconstructionArgs, StartReconstructionResponse} from "../../graphql/reconstruction";
import {ReconstructionStatusLabel} from "../common/ReconstructionStatus";
import {useAppLayout} from "../../hooks/useAppLayout";
import {RequestAccess} from "./RequestAccess";
import {RequestAccessResponse} from "../../models/accessRequest";
import {ActionPanel} from "../common/ActionPanel";

export const CandidateActions = ({neuron, showAnnotators}: { neuron: NeuronShape, showAnnotators: boolean }) => {
    const clipboard = useClipboard();
    const appLayout = useAppLayout();

    const [isIssueModalVisible, setIsIssueModalVisible] = useState(false);
    const [accessMessage, setAccessMessage] = useState<string>(null);

    const user = useUser();
    const isAuthenticated = useIsAuthenticated();

    const [startReconstruction, {loading}] = useMutation<StartReconstructionResponse, StartReconstructionArgs>(OPEN_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [CANDIDATE_NEURONS_QUERY, RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error starting reconstruction", e.message)
        });

    const onRequestAccessResponse = (response: RequestAccessResponse) => {
        let message = "The request for access has been received.  A member of the Neuron Morphology Community Portal be in contact."

        switch (response) {
            case RequestAccessResponse.Throttled:
                message = "There have been too many requests from your location in short period of time.  Please try again later."
                break;
            case RequestAccessResponse.DuplicateApproved:
            case RequestAccessResponse.DuplicateDenied:
            case RequestAccessResponse.DuplicateOpen:
                message = "Access has already be requested for this email address.  If you have not yet received a response, a member of the Neuron Morphology" +
                    "Community Portal be in contact in soon as your request can be processed."
                break;
        }

        setAccessMessage(message);
    }

    if (!neuron) {
        return <NoCandidate panel={isAuthenticated ? null : <RequestAccess onResponse={onRequestAccessResponse}/>}/>;
    }

    const isUser = isUserReconstruction(user.id, neuron.reconstructions);

    const canAnnotate = !loading && !isUser;

    const annotateButton = canAnnotate ? (<Tooltip label="A new reconstruction associated with this neuron will be associated with your account.">
        <ReconstructionActionButton action={ReconstructionAction.Open} onClick={() => startReconstruction({variables: {neuronId: neuron.id}})}>
            Add to My Annotations
        </ReconstructionActionButton>
    </Tooltip>) : null;

    const reportIssueButton = <ReconstructionActionButton action={ReconstructionAction.ReportIssue}
                                                          onClick={() => setIsIssueModalVisible(true)}/>

    const actions = isAuthenticated ?
        (<Group>
            {reportIssueButton}
            {annotateButton}
        </Group>) : <RequestAccess onResponse={onRequestAccessResponse}/>;

    const iconColor = isUser ? "var(--mantine-color-blue-4)" : "var(--mantine-color-green-4)";

    const info = appLayout.showReferenceIds ? (
        <Badge variant="light" onClick={() => clipboard.copy(neuron.id)}>{neuron.id}</Badge>) : null;

    const status = showAnnotators ? <ReconstructionStatusLabel reconstructions={neuron.reconstructions}/> : null;

    return (
        <Group p={12} justify="space-between">
            <Group>
                <IconGitMerge color={iconColor} size={32}/>
                <Stack justify="flex-start" align="flex-start" gap={0}>
                    <Group>
                        <Text fw={500}>{neuron.label?.trim() || "(no label)"}</Text>
                        {status}
                        {info}
                    </Group>
                    <Text c="dimmed" fw={400} size="sm">Specimen {neuron.specimen.label}</Text>
                </Stack>
            </Group>
            {actions}
            <IssueModal show={isIssueModalVisible} neuron={neuron} onClose={() => setIsIssueModalVisible(false)}/>
        </Group>
    )
}

const NoCandidate = ({panel = null}: { panel?: React.JSX.Element }) => (
    <ActionPanel title="No Candidate Selected" message="Select a candidate for additional options." renderIcon={
        (size) => <IconGitMerge color="var(--mantine-color-red-3)" size={size}/>
    } actions={panel}/>
)
