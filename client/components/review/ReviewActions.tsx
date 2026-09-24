import * as React from "react";
import {useEffect, useState} from "react";
import {useMutation} from "@apollo/client";
import {Badge, Divider, Group, Stack, Text} from "@mantine/core";
import {useClipboard} from "@mantine/hooks";
import {IconGitMerge} from "@tabler/icons-react";

import {
    APPROVE_RECONSTRUCTION_MUTATION,
    ApproveReconstructionArgs,
    ApproveReconstructionResponse,
    DISCARD_RECONSTRUCTION_MUTATION,
    DiscardReconstructionResponse,
    ReconstructionStatusModifierArgs,
    REJECT_RECONSTRUCTION_MUTATION,
    RejectReconstructionResponse,
    RESET_RECONSTRUCTION_PIPELINE_MUTATION,
    ResetReconstructionPipelineResponse,
    RECONSTRUCTIONS_QUERY, PublishReconstructionResponse, PublishReconstructionVariables, PUBLISH_RECONSTRUCTION_MUTATION
} from "../../graphql/reconstruction";
import {Reconstruction} from "../../models/reconstruction";
import {errorNotification} from "../common/NotificationHelper";
import {ReconstructionAction} from "../../models/reconstructionAction";
import {gateFor} from "../../models/reconstructionGates";
import {ReconstructionActionButton} from "../common/ReconstructionAction";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {atlasStatusName} from "../../models/atlasReconstructionStatus";
import {useAppLayout} from "../../hooks/useAppLayout";
import {useUser} from "../../hooks/useUser";
import {useRetryPhase} from "../../hooks/useRetryPhase";
import {ArchiveConfirmationModal} from "./ArchiveConfirmationModal";
import {ResetPipelineConfirmationModal} from "./ResetPipelineConfirmationModal";

// Every hook stays above the no-selection return: the Review tab mounts this bar before a row is chosen and then
// re-renders the same instance with the selection.
export const ReviewActions = ({reconstruction}: { reconstruction: Reconstruction }) => {
    const clipboard = useClipboard();
    const appLayout = useAppLayout();
    const user = useUser();
    const retryPhase = useRetryPhase();

    const [isArchiveModelOpen, setIsArchiveModelOpen] = useState<boolean>(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

    const [rejectAnnotation] = useMutation<RejectReconstructionResponse, ReconstructionStatusModifierArgs>(REJECT_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error Rescinding Reconstruction", e.message)
        });

    const [approveAnnotation] = useMutation<ApproveReconstructionResponse, ApproveReconstructionArgs>(APPROVE_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error Approving Reconstruction", e.message)
        });

    const [publishReconstruction] = useMutation<PublishReconstructionResponse, PublishReconstructionVariables>(PUBLISH_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => {
                if (e.graphQLErrors?.length > 0) {
                    if (e.graphQLErrors[0].extensions?.code == 1001) {
                        setIsArchiveModelOpen(true);
                        return;
                    }
                }

                errorNotification("Error Publishing Reconstruction", e.message)
            }
        });

    const [discardReconstruction] = useMutation<DiscardReconstructionResponse, ReconstructionStatusModifierArgs>(DISCARD_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error Discarding Reconstruction", e.message)
        });

    const [resetPipeline] = useMutation<ResetReconstructionPipelineResponse, ReconstructionStatusModifierArgs>(RESET_RECONSTRUCTION_PIPELINE_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error Replaying Pipeline", e.message)
        });

    // Keyed on primitives: the reconstructions query polls, replacing the object every few seconds.
    useEffect(() => {
        const failure = reconstruction?.phaseFailure;

        if (failure) {
            errorNotification(atlasStatusName(failure.phase), failure.reason ?? "No reason was recorded.");
        }
    }, [reconstruction?.id, reconstruction?.phaseFailure?.failedAt]);

    if (!reconstruction) {
        return <NoSelection/>;
    }

    const variables = {variables: {reconstructionId: reconstruction.id}};

    const actionButton = (action: ReconstructionAction, onClick: () => void) => {
        const gate = gateFor(action, {
            area: "review",
            status: reconstruction.status,
            childStatus: reconstruction.atlasReconstruction?.status,
            permissions: user?.permissions ?? 0,
            annotatorId: reconstruction.annotatorId,
            userId: user?.id
        });

        return gate.visible ? <ReconstructionActionButton key={action} action={action} disabled={!gate.enabled} onClick={onClick}/> : null;
    };

    const approve = (targetStatus: ReconstructionStatus) => approveAnnotation({variables: {reconstructionId: reconstruction.id, targetStatus}});

    const groups = [
        [
            actionButton(ReconstructionAction.Reject, () => rejectAnnotation(variables)),
            actionButton(ReconstructionAction.Discard, () => discardReconstruction(variables))
        ],
        [
            actionButton(ReconstructionAction.ApprovePublish, () => approve(ReconstructionStatus.Approved)),
            actionButton(ReconstructionAction.ApprovePeer, () => approve(ReconstructionStatus.PublishReview)),
            actionButton(ReconstructionAction.Publish, () => publishReconstruction({variables: {reconstructionId: reconstruction.id, replaceExisting: false}}))
        ],
        [
            actionButton(ReconstructionAction.RetryPhase, () => retryPhase(reconstruction)),
            actionButton(ReconstructionAction.ResetPipeline, () => setIsResetModalOpen(true))
        ]
    ].map(g => g.filter(b => b != null)).filter(g => g.length > 0);

    async function tryArchiveReconstruction(replaceExisting: boolean) {
        if (replaceExisting) {
            await publishReconstruction({
                variables: {
                    reconstructionId: reconstruction.id,
                    replaceExisting: true
                }
            });
        }

        setIsArchiveModelOpen(false);
    }

    async function onResetClosed(confirmed: boolean) {
        setIsResetModalOpen(false);

        if (confirmed) {
            await resetPipeline(variables);
        }
    }

    const actions = <Group justify="flex-end">
        {groups.map((g, index) => (
            <React.Fragment key={index}>
                {index > 0 ? <Divider orientation="vertical"/> : null}
                {g}
            </React.Fragment>
        ))}
        <ArchiveConfirmationModal show={isArchiveModelOpen} onClose={(b) => tryArchiveReconstruction(b)}/>
        <ResetPipelineConfirmationModal show={isResetModalOpen} sourceStatus={reconstruction.status} onClose={(b) => onResetClosed(b)}/>
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
                        {info}
                    </Group>
                    <Text c="dimmed" fw={400} size="sm">Specimen {reconstruction.neuron.specimen.label}</Text>
                </Stack>
            </Group>
            {actions}
        </Group>
    )

}

const NoSelection = ({panel = null}: { panel?: React.JSX.Element }) => (
    <Group p={12} justify="space-between">
        <Group>
            <IconGitMerge color="var(--mantine-color-red-3)" size={32}/>
            <Stack justify="flex-start" align="flex-start" gap={0}>
                <Text fw={500}>No Reconstruction Selected</Text>
                <Text c="dimmed" fw={400} size="sm">Select a reconstruction to view additional details, modify data, or change its status.</Text>
            </Stack>
        </Group>
        {panel}
    </Group>
)
