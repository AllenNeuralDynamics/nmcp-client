import * as React from "react";
import {useMutation} from "@apollo/client";
import {Badge, Divider, Group, Stack, Text} from "@mantine/core";
import {IconGitMerge} from "@tabler/icons-react";

import {useClipboard} from "@mantine/hooks";
import {Reconstruction} from "../../models/reconstruction";
import {
    DISCARD_RECONSTRUCTION_MUTATION,
    DiscardReconstructionResponse,
    PAUSE_RECONSTRUCTION_MUTATION,
    PauseReconstructionResponse,
    ReconstructionStatusModifierArgs,
    RESUME_RECONSTRUCTION_MUTATION,
    ResumeReconstructionResponse,
    RECONSTRUCTIONS_QUERY
} from "../../graphql/reconstruction";
import {ReconstructionStatus, statusCanReopen} from "../../models/reconstructionStatus";
import {ReconstructionAction} from "../../models/reconstructionAction";
import {ReconstructionActionButton} from "../common/ReconstructionAction";
import {ReconstructionStatusLabel} from "../common/ReconstructionStatus";
import {useAppLayout} from "../../hooks/useAppLayout";

export type ReconstructionPanelProps = {
    reconstruction: Reconstruction;
    userId: string;

    showRequestReviewDialog(id: string, status: ReconstructionStatus): void;
}

export const ReconstructionActions = (props: ReconstructionPanelProps) => {
    const clipboard = useClipboard();
    const appLayout = useAppLayout();

    const [pauseReconstruction] = useMutation<PauseReconstructionResponse, ReconstructionStatusModifierArgs>(PAUSE_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => console.log(e)
        });

    const [resumeReconstruction] = useMutation<ResumeReconstructionResponse, ReconstructionStatusModifierArgs>(RESUME_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => console.log(e)
        });

    const [cancelAnnotation] = useMutation<DiscardReconstructionResponse, ReconstructionStatusModifierArgs>(DISCARD_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => console.log(e)
        });

    if (props.reconstruction == null) {
        return (<NoReconstruction/>);
    }

    let reopenButton = null;
    let holdButton = null;
    let peerReviewButton = null;
    let reviewButton = null;
    let cancelButton = null;

    let moreThanCancel = false;

    if (props.reconstruction.annotatorId == props.userId) {
        if (props.reconstruction.status != ReconstructionStatus.Published) {
            cancelButton = <ReconstructionActionButton action={ReconstructionAction.Discard}
                                                       onClick={() => cancelAnnotation({variables: {reconstructionId: props.reconstruction.id}})}/>
        }

        if (statusCanReopen(props.reconstruction.status)) {
            reopenButton = <ReconstructionActionButton action={ReconstructionAction.Reopen}
                                                       onClick={() => resumeReconstruction({variables: {reconstructionId: props.reconstruction.id}})}/>
            moreThanCancel = true;
        }

        if (props.reconstruction.status == ReconstructionStatus.InProgress) {
            holdButton = <ReconstructionActionButton action={ReconstructionAction.Hold}
                                                     onClick={() => pauseReconstruction({variables: {reconstructionId: props.reconstruction.id}})}/>
            peerReviewButton = <ReconstructionActionButton action={ReconstructionAction.RequestPeerReview}
                                                           onClick={() => props.showRequestReviewDialog(props.reconstruction.id, ReconstructionStatus.PeerReview)}/>
            reviewButton = <ReconstructionActionButton action={ReconstructionAction.RequestPublishReview}
                                                       onClick={() => props.showRequestReviewDialog(props.reconstruction.id, ReconstructionStatus.PublishReview)}/>
            moreThanCancel = true;
        }
    }

    const actions = <Group justify="flex-end">
        {cancelButton}
        {cancelButton && moreThanCancel ? <Divider orientation="vertical"/> : null}
        {reopenButton}
        {holdButton}
        {peerReviewButton}
        {reviewButton}
    </Group>

    const info = appLayout.showReferenceIds ? (
        <Badge variant="light" onClick={() => clipboard.copy(props.reconstruction.id)}>{props.reconstruction.id}</Badge>) : null;

    return (
        <Group p={12} justify="space-between">
            <Group>
                <IconGitMerge color="var(--mantine-color-green-4)" size={32}/>
                <Stack justify="flex-start" align="flex-start" gap={0}>
                    <Group>
                        <Text size="lg" fw={500}> {props.reconstruction.neuron.label}</Text>
                        <ReconstructionStatusLabel reconstructions={props.reconstruction}/>
                        {info}
                    </Group>
                    <Group>
                        <Text c="dimmed" fw={400} size="sm">Specimen {props.reconstruction.neuron.specimen.label}</Text>
                    </Group>
                </Stack>
            </Group>
            {actions}
        </Group>
    )
}

const NoReconstruction = () => (
    <Group p={12} justify="space-between">
        <Group>
            <IconGitMerge color="var(--mantine-color-red-3)" size={32}/>
            <Stack justify="flex-start" align="flex-start" gap={0}>
                <Text size="lg" fw={500}>No Reconstruction Selected</Text>
                <Text c="dimmed" fw={400} size="sm">Select a reconstruction from the table to update its status if you are the annotator.</Text>
            </Stack>
        </Group>
    </Group>
)
