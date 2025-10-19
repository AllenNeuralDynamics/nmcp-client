import * as React from "react";
import {useState} from "react";
import {Badge, Button, Group, Stack, Text} from "@mantine/core";
import {IconArchive, IconFlagExclamation, IconZoomCode, IconZoomQuestion} from "@tabler/icons-react";

import {IssueShape, IssueStatus} from "../../../models/issue";
import {useClipboard} from "@mantine/hooks";
import {CloseIssueModal} from "./CloseIssueModal";
import {useMutation} from "@apollo/client";
import {MODIFY_ISSUE_MUTATION, ModifyIssueResponse, ModifyIssueVariables, OPEN_ISSUES_QUERY} from "../../../graphql/issue";
import {errorNotification} from "../../common/NotificationHelper";
import {useAppLayout} from "../../../hooks/useAppLayout";

export const IssueActions = ({issue}: { issue: IssueShape }) => {
    const clipboard = useClipboard();
    const appLayout = useAppLayout();

    const [isCloseModelOpen, setIsCloseModelOpen] = useState<boolean>(false);

    const [modifyStatus] = useMutation<ModifyIssueResponse, ModifyIssueVariables>(MODIFY_ISSUE_MUTATION, {
        refetchQueries: [OPEN_ISSUES_QUERY],
        onCompleted: async (data) => {
            if (!data.modifyIssue) {
                errorNotification("Report Issue", "There was an unknown error updating the status.");
            }
        },
        onError: (e) => errorNotification("Report Issue", e.message)
    });

    if (!issue) {
        return <NoIssue/>
    }

    const onTryCloseIssue = async (issue: IssueShape) => {
        setIsCloseModelOpen(true);
    }

    const closeButton = <Button variant="light" leftSection={<IconArchive size={18}/>} onClick={() => onTryCloseIssue(issue)}>Close...</Button>;

    const modifyButton = issue.status == IssueStatus.Unreviewed ? (
        <Button variant="light" color="teal" leftSection={<IconZoomCode size={18}/>}
                onClick={() => modifyStatus({variables: {id: issue.id, status: IssueStatus.UnderInvestigation}})}>
            Mark Under Investigation
        </Button>
    ) : null;

    const unreviewedButton = issue.status == IssueStatus.UnderInvestigation ? (
        <Button variant="light" color="cyan" leftSection={<IconZoomQuestion size={18}/>}
                onClick={() => modifyStatus({variables: {id: issue.id, status: IssueStatus.Unreviewed}})}>
            Mark Unreviewed
        </Button>
    ) : null;

    const actions = (
        <Group>
            {unreviewedButton}
            {modifyButton}
            {closeButton}
        </Group>
    )

    const info = appLayout.showReferenceIds ? (
        <Badge variant="light" onClick={() => clipboard.copy(issue.id)}>{issue.id}</Badge>) : null;

    return (
        <Group p={12} justify="space-between">
            <Group>
                <IconFlagExclamation color="var(--mantine-color-red-8)" size={32}/>
                <Stack justify="flex-start" align="flex-start" gap={0}>
                    <Group>
                        <Text fw={500}>{issue.neuron?.label ?? "(none)"}</Text>
                        {info}
                    </Group>
                    <Text c="dimmed" fw={400} size="sm">Neuron {issue.neuron?.label ?? "(none)"}</Text>
                </Stack>
            </Group>
            {actions}
            <CloseIssueModal show={isCloseModelOpen} issue={issue} onClose={() => setIsCloseModelOpen(false)}/>
        </Group>
    )
}

const NoIssue = ({panel = null}: { panel?: React.JSX.Element }) => (
    <Group p={12} justify="space-between">
        <Group>
            <IconFlagExclamation color="var(--mantine-color-red-3)" size={32}/>
            <Stack justify="flex-start" align="flex-start" gap={0}>
                <Text fw={500}>No Issue Selected</Text>
                <Text c="dimmed" fw={400} size="sm">Select an issue for additional options.</Text>
            </Stack>
        </Group>
        {panel}
    </Group>
)
