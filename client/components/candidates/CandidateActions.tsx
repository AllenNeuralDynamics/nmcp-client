import * as React from "react";
import {useState} from "react";
import {useIsAuthenticated} from "@azure/msal-react";
import {useMutation} from "@apollo/client";
import {Group} from "@mantine/core";
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
import {RequestAccess} from "./RequestAccess";
import {RequestAccessResponse} from "../../models/accessRequest";
import {ActionPanel} from "../common/ActionPanel";
import {MessageBox} from "../common/MessageBox";

export const CandidateActions = ({neuron, showAnnotators}: { neuron: NeuronShape, showAnnotators: boolean }) => {
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
                message = "There have been too many requests from your location in a short period of time.  Please try again later."
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

    const modal = isIssueModalVisible ? <IssueModal show={isIssueModalVisible} neuron={neuron} onClose={() => setIsIssueModalVisible(false)}/> : (
        accessMessage ? <MessageBox message={accessMessage} opened={true} centered={true} cancellable={false} title="Access Request"
                                    onConfirm={() => setAccessMessage(null)}/> : null);

    if (!neuron) {
        return <ActionPanel title="No Candidate Selected" message="Select a candidate for additional options." renderIcon={
            (size) => <IconGitMerge color="var(--mantine-color-red-3)" size={size}/>
        } actions={isAuthenticated ? null : <RequestAccess onResponse={onRequestAccessResponse}/>} modal={modal}/>
    }

    const isUser = isUserReconstruction(user.id, neuron.reconstructions);

    const canAnnotate = !loading && !isUser;

    const annotateButton = canAnnotate ? (
        <ReconstructionActionButton action={ReconstructionAction.Open} onClick={() => startReconstruction({variables: {neuronId: neuron.id}})}/>) : null;

    const reportIssueButton = <ReconstructionActionButton action={ReconstructionAction.ReportIssue}
                                                          onClick={() => setIsIssueModalVisible(true)}/>

    const actions = isAuthenticated ?
        (<Group>
            {reportIssueButton}
            {annotateButton}
        </Group>) : <RequestAccess onResponse={onRequestAccessResponse}/>;

    const iconColor = isUser ? "var(--mantine-color-blue-4)" : "var(--mantine-color-green-4)";

    const status = showAnnotators ? <ReconstructionStatusLabel reconstructions={neuron.reconstructions}/> : null;

    return (
        <ActionPanel title={neuron.label?.trim() || "(no label)"} status={status} id={neuron.id} message={`Specimen ${neuron.specimen.label}`}
                     renderIcon={(size) => {
                         return <IconGitMerge color={iconColor} size={size}/>
                     }} actions={actions} modal={modal}/>
    )
}
