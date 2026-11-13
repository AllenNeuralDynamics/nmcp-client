import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Group} from "@mantine/core";
import {useIsAuthenticated} from "@azure/msal-react";
import {IconGitMerge} from "@tabler/icons-react";

import {useUser} from "../../hooks/useUser";
import {NeuronShape} from "../../models/neuron";
import {IssueModal} from "./IssueModal";
import {isUserAnnotation} from "../../models/annotation";
import {errorNotification} from "../common/NotificationHelper";
import {ReconstructionActionButton} from "../common/ReconstructionAction";
import {ReconstructionAction} from "../../models/reconstructionAction";
import {OPEN_ANNOTATION_MUTATION, ANNOTATIONS_QUERY, OpenAnnotationArgs, OpenAnnotationResponse} from "../../graphql/annotation";
import {ReconstructionStatusLabel} from "../common/ReconstructionStatus";
import {RequestAccess, requestAccessResponseMessage} from "../common/RequestAccess";
import {RequestAccessResponse} from "../../models/accessRequest";
import {ActionPanel} from "../common/ActionPanel";
import {MessageBox} from "../common/MessageBox";

export const CandidateActions = ({neuron, showAnnotators, onReconstructionStarted}: {
    neuron: NeuronShape,
    showAnnotators: boolean,
    onReconstructionStarted?: (neuronId: string) => void
}) => {
    const [isIssueModalVisible, setIsIssueModalVisible] = useState(false);
    const [accessMessage, setAccessMessage] = useState<string>(null);

    const user = useUser();
    const isAuthenticated = useIsAuthenticated();

    const [startReconstruction, {loading}] = useMutation<OpenAnnotationResponse, OpenAnnotationArgs>(OPEN_ANNOTATION_MUTATION,
        {
            refetchQueries: [ANNOTATIONS_QUERY],
            onError: (e) => errorNotification("Error starting reconstruction", e.message)
        });

    const onRequestAccessResponse = (response: RequestAccessResponse) => {
        setAccessMessage(requestAccessResponseMessage(response));
    }

    const modal = isIssueModalVisible ? <IssueModal show={isIssueModalVisible} neuron={neuron} onClose={() => setIsIssueModalVisible(false)}/> : (
        accessMessage ? <MessageBox message={accessMessage} opened={true} centered={true} cancellable={false} title="Access Request"
                                    onConfirm={() => setAccessMessage(null)}/> : null);

    if (!neuron) {
        return <ActionPanel title="No Candidate Selected" message="Select a candidate for additional options." renderIcon={
            (size) => <IconGitMerge color="var(--mantine-color-red-3)" size={size}/>
        } actions={isAuthenticated ? null : <RequestAccess onResponse={onRequestAccessResponse}/>} modal={modal}/>
    }

    const isUser = user != null && isUserAnnotation(user.id, neuron.annotations);

    const canAnnotate = !loading && !isUser;

    const annotateButton = canAnnotate ? (
        <ReconstructionActionButton action={ReconstructionAction.Open} onClick={() => startReconstruction({
            variables: {neuronId: neuron.id},
            onCompleted: () => onReconstructionStarted?.(neuron.id)
        })}/>) : null;

    const reportIssueButton = <ReconstructionActionButton action={ReconstructionAction.ReportIssue}
                                                          onClick={() => setIsIssueModalVisible(true)}/>

    const actions = isAuthenticated ?
        (<Group>
            {reportIssueButton}
            {annotateButton}
        </Group>) : <RequestAccess onResponse={onRequestAccessResponse}/>;

    const iconColor = isUser ? "var(--mantine-color-blue-4)" : "var(--mantine-color-green-4)";

    const status = showAnnotators ? <ReconstructionStatusLabel reconstructions={neuron.annotations}/> : null;

    return (
        <ActionPanel title={neuron.label?.trim() || "(no label)"} status={status} id={neuron.id} message={`Specimen ${neuron.specimen.label}`}
                     renderIcon={(size) => {
                         return <IconGitMerge color={iconColor} size={size}/>
                     }} actions={actions} modal={modal}/>
    )
}
