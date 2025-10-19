import * as React from "react";
import {useState} from "react";
import {useIsAuthenticated} from "@azure/msal-react";
import {useMutation} from "@apollo/client";
import {Badge, Button, Group, Popover, Stack, Text, TextInput, Tooltip} from "@mantine/core";

import {useUser} from "../../hooks/useUser";
import {NeuronShape} from "../../models/neuron";
import {IssueModal} from "./IssueModal";
import {IconGitMerge} from "@tabler/icons-react";
import {isUserReconstruction} from "../../models/reconstruction";
import {CANDIDATE_NEURONS_QUERY} from "../../graphql/candidates";
import {errorNotification} from "../common/NotificationHelper";
import {ReconstructionActionButton} from "../common/ReconstructionAction";
import {ReconstructionAction} from "../../models/reconstructionAction";
import {useClipboard} from "@mantine/hooks";
import {OPEN_RECONSTRUCTION_MUTATION, RECONSTRUCTIONS_QUERY, StartReconstructionArgs, StartReconstructionResponse} from "../../graphql/reconstruction";
import {ReconstructionStatusLabel} from "../common/ReconstructionStatus";
import {useAppLayout} from "../../hooks/useAppLayout";

const RequestAccess = () => {
    const [opened, setOpened] = useState(false);

    return <Popover opened={opened} onChange={setOpened}>
        <Popover.Target>
            <Button variant="subtle" onClick={() => setOpened((o) => !o)}>Request access to annotate neurons</Button>
        </Popover.Target>
        <Popover.Dropdown>
            <Stack maw={400}>
                <Group justify="space-between">
                    <TextInput label="First Name" placeholder="Your first name"/>
                    <TextInput label="Last Name" placeholder="Your last name"/>
                </Group>
                <TextInput label="Institution" placeholder="Your Institution"/>
                <TextInput label="Email" placeholder="Your email"/>
                <TextInput label="Proposed Use" placeholder="Please briefly describe your proposed use."/>
                <Text size="sm" c="dimmed">A member of the Neuron Morphology Community Portal will contact you regarding access to annotate and publish
                    reconstructions.</Text>
                <Group justify="end">
                    <Button size="small" onClick={() => setOpened(false)}>Request</Button>
                </Group>
            </Stack>
        </Popover.Dropdown>
    </Popover>
}

export const CandidateActions = ({neuron, showAnnotators}: { neuron: NeuronShape, showAnnotators: boolean }) => {
    const clipboard = useClipboard();
    const appLayout = useAppLayout();

    const [isIssueModalVisible, setIsIssueModalVisible] = useState(false);

    const user = useUser();
    const isAuthenticated = useIsAuthenticated();

    const [startReconstruction, {loading}] = useMutation<StartReconstructionResponse, StartReconstructionArgs>(OPEN_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [CANDIDATE_NEURONS_QUERY, RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error starting reconstruction", e.message)
        });

    if (!neuron) {
        return <NoCandidate panel={isAuthenticated ? null : <RequestAccess/>}/>;
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
        </Group>) : <RequestAccess/>;

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
    <Group p={12} justify="space-between">
        <Group>
            <IconGitMerge color="var(--mantine-color-red-3)" size={32}/>
            <Stack justify="flex-start" align="flex-start" gap={0}>
                <Text fw={500}>No Candidate Selected</Text>
                <Text c="dimmed" fw={400} size="sm">Select a candidate for additional options.</Text>
            </Stack>
        </Group>
        {panel}
    </Group>
)
