import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Group, Modal, Select, Stack, Textarea} from "@mantine/core";

import {
    CLOSE_ISSUE_MUTATION,
    CloseIssueResponse,
    CloseIssueVariables, OPEN_ISSUES_QUERY,
} from "../../../graphql/issue";
import {IssueResolutionKind, issueResolutionKindName, IssueShape} from "../../../models/issue";
import {errorNotification, successNotification} from "../../common/NotificationHelper";

const issueResponseKindOptions = Object.values(IssueResolutionKind).filter(value => typeof value === "number").map(r => {
    return {
        label: issueResolutionKindName(r),
        value: `${r}`
    };
});

type CloseIssueModelProps = {
    show: boolean;
    issue: IssueShape;

    onClose(): void;
}

export const CloseIssueModal = (props: CloseIssueModelProps) => {
    const [kind, setKind] = useState<string>(null);
    const [description, setDescription] = useState<string>("");

    const [closeIssue] = useMutation<CloseIssueResponse, CloseIssueVariables>(CLOSE_ISSUE_MUTATION, {
        refetchQueries: [OPEN_ISSUES_QUERY],
        onCompleted: async (data) => {
            if (data.closeIssue != null) {
                successNotification("Report Issue", "The issue was successfully closed");
            } else {
                errorNotification("Report Issue", "There was an unknown error closing this issue.");
            }

            setDescription("");
        },
        onError: (e) => errorNotification("Report Issue", e.message)
    });

    const onCloseClick = async () => {
        await closeIssue({
            variables: {id: props.issue.id, resolutionKind: parseInt(kind), resolution: description}
        });

        props.onClose();
    }

    const isValidDescription = description?.length > 0;

    return (
        <Modal.Root opened={props.show} onClose={props.onClose} size="lg" centered>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>Close Issue</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack m={0} p={12}>
                        <Select label="Reason for closing" data={issueResponseKindOptions} value={kind} onChange={setKind}/>
                        <Textarea label="Description" placeholder="Enter a description..." autosize minRows={4} maxRows={20} value={description}
                                  onChange={(e) => setDescription(e.currentTarget.value?.toString())}/>

                        <Group justify="flex-end">
                            <Button disabled={!isValidDescription} onClick={onCloseClick}>Close</Button>
                        </Group>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
}
