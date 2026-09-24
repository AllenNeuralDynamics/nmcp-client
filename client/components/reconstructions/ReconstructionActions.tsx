import * as React from "react";
import {useMutation} from "@apollo/client";
import {Badge, Divider, Group, Stack, Text} from "@mantine/core";
import {useClipboard} from "@mantine/hooks";
import {IconGitMerge} from "@tabler/icons-react";

import {Reconstruction} from "../../models/reconstruction";
import {
    DISCARD_RECONSTRUCTION_MUTATION,
    DiscardReconstructionResponse,
    MARK_UNTRACEABLE_MUTATION,
    MarkUntraceableResponse,
    PAUSE_RECONSTRUCTION_MUTATION,
    PauseReconstructionResponse,
    ReconstructionStatusModifierArgs,
    RESUME_RECONSTRUCTION_MUTATION,
    ResumeReconstructionResponse,
    RECONSTRUCTIONS_QUERY
} from "../../graphql/reconstruction";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {ReconstructionAction} from "../../models/reconstructionAction";
import {gateFor} from "../../models/reconstructionGates";
import {ReconstructionActionButton} from "../common/ReconstructionAction";
import {ReconstructionStatusLabel} from "../common/ReconstructionStatus";
import {errorNotification} from "../common/NotificationHelper";
import {useAppLayout} from "../../hooks/useAppLayout";
import {useUser} from "../../hooks/useUser";
import {CreateRevisionPopover} from "./CreateRevisionPopover";

export type ReconstructionPanelProps = {
    reconstruction: Reconstruction;
    userId: string;

    showRequestReviewDialog(id: string, status: ReconstructionStatus): void;
}

export const ReconstructionActions = (props: ReconstructionPanelProps) => {
    const clipboard = useClipboard();
    const appLayout = useAppLayout();
    const user = useUser();

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

    const [markUntraceable] = useMutation<MarkUntraceableResponse, ReconstructionStatusModifierArgs>(MARK_UNTRACEABLE_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error Marking Reconstruction Untraceable", e.message)
        });

    if (props.reconstruction == null) {
        return (<NoReconstruction/>);
    }

    const reconstruction = props.reconstruction;

    const variables = {variables: {reconstructionId: reconstruction.id}};

    const actionButton = (action: ReconstructionAction, onClick: () => void) => {
        const gate = gateFor(action, {
            area: "annotator",
            status: reconstruction.status,
            childStatus: reconstruction.atlasReconstruction?.status,
            permissions: user?.permissions ?? 0,
            annotatorId: reconstruction.annotatorId,
            userId: props.userId
        });

        return gate.visible ? <ReconstructionActionButton action={action} disabled={!gate.enabled} onClick={onClick}/> : null;
    };

    const isOwner = reconstruction.annotatorId == props.userId;

    const revisePopover = reconstruction.status == ReconstructionStatus.Published ? <CreateRevisionPopover id={reconstruction.id}/> : null;

    const actions = <Group justify="flex-end">
        {actionButton(ReconstructionAction.Discard, () => cancelAnnotation(variables))}
        {actionButton(ReconstructionAction.MarkUntraceable, () => markUntraceable(variables))}
        {isOwner ? <Divider orientation="vertical"/> : null}
        {actionButton(ReconstructionAction.Reopen, () => resumeReconstruction(variables))}
        {actionButton(ReconstructionAction.Hold, () => pauseReconstruction(variables))}
        {actionButton(ReconstructionAction.RequestPeerReview, () => props.showRequestReviewDialog(reconstruction.id, ReconstructionStatus.PeerReview))}
        {actionButton(ReconstructionAction.RequestPublishReview, () => props.showRequestReviewDialog(reconstruction.id, ReconstructionStatus.PublishReview))}
        {revisePopover}
    </Group>

    const info = appLayout.showReferenceIds ? (
        <Badge variant="light" onClick={() => clipboard.copy(reconstruction.id)}>{reconstruction.id}</Badge>) : null;

    return (
        <Group p={12} justify="space-between">
            <Group>
                <IconGitMerge color="var(--mantine-color-green-4)" size={32}/>
                <Stack justify="flex-start" align="flex-start" gap={0}>
                    <Group>
                        <Text size="lg" fw={500}> {reconstruction.neuron.label}</Text>
                        <ReconstructionStatusLabel reconstructions={reconstruction}/>
                        {info}
                    </Group>
                    <Group>
                        <Text c="dimmed" fw={400} size="sm">Specimen {reconstruction.neuron.specimen.label}</Text>
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
