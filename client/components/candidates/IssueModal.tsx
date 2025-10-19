import * as React from "react";
import {useEffect, useState} from "react";
import {useMutation} from "@apollo/client";
import {Alert, Button, Group, Modal, Stack, Textarea} from "@mantine/core";
import {IconExclamationCircle} from "@tabler/icons-react";

import {OPEN_ISSUE_MUTATION, OPEN_ISSUES_QUERY, OpenIssueResponse, OpenIssueVariables} from "../../graphql/issue";
import {errorNotification, successNotification} from "../common/NotificationHelper";
import {NeuronShape} from "../../models/neuron";
import {IssueKind, IssueReferenceKind} from "../../models/issue";

type IssueModelProps = {
    show: boolean;
    neuron: NeuronShape;

    onClose(): void;
}

const MIN_DESCRIPTION_LENGTH = 1;
const MAX_DESCRIPTION_LENGTH = 1024;

export const IssueModal = (props: IssueModelProps) => {
    const [state, setState] = useState({
        description: "",
        lastNeuronId: props.neuron.id
    });

    const [createIssue, {data, error}] = useMutation<OpenIssueResponse, OpenIssueVariables>(OPEN_ISSUE_MUTATION, {
        refetchQueries: [OPEN_ISSUES_QUERY],
        onCompleted: async (data) => {
            if (!error && data.openIssue) {
                successNotification("Report Issue", "The issue was successfully reported");
            } else {
                errorNotification("Report Issue", "There was an unknown error reporting this issue");
            }

            setState({...state, description: ""});
        },
        onError: (e) => console.log(e)
    });

    useEffect(() => {
        if (props.neuron.id != state.lastNeuronId) {
            setState({...state, lastNeuronId: props.neuron.id, description: ""});
        }
    }, [props.neuron]);

    const onReportClick = async () => {
        const description = state.description?.length < MAX_DESCRIPTION_LENGTH ? state.description : state.description.substring(0, MAX_DESCRIPTION_LENGTH);

        await createIssue({
            variables: {kind: IssueKind.Candidate, description: description, references: [{id: props.neuron.id, kind: IssueReferenceKind.Neuron}]}
        });

        props.onClose();
    }

    const isValidDescription = state.description?.length > MIN_DESCRIPTION_LENGTH;

    let warningMessage = null;

    if (isValidDescription && state.description.length > MAX_DESCRIPTION_LENGTH) {
        const message = `Your description will be truncated due to length.`;

        warningMessage = (
            <Alert color="red.3" icon={<IconExclamationCircle/>}>
                {message}
            </Alert>);
    }

    const label = `Please describe the issue with neuron ${props.neuron.label}`;

    return (
        <Modal size="lg" centered opened={props.show} onClose={props.onClose} title="Report an Issue">
            <Stack>
                <Textarea label={label} placeholder="Enter a description..." autosize minRows={4} maxRows={20} value={state.description}
                          onChange={(e) => setState({...state, description: e.currentTarget.value?.toString()})}/>

                {warningMessage}
                <Group justify="flex-end">
                    <Button disabled={!isValidDescription} onClick={onReportClick}>Report</Button>
                </Group>
            </Stack>
        </Modal>
    );
}
