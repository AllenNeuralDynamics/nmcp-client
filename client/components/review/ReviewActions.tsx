import * as React from "react";
import {Badge, Divider, Group, Stack, Text} from "@mantine/core";
import {IconGitMerge} from "@tabler/icons-react";

import {Reconstruction} from "../../models/reconstruction";
import {useClipboard} from "@mantine/hooks";
import {useMutation} from "@apollo/client";
import {
    APPROVE_RECONSTRUCTION_MUTATION,
    ApproveReconstructionArgs,
    ApproveReconstructionResponse,
    ReconstructionStatusModifierArgs,
    REJECT_RECONSTRUCTION_MUTATION,
    RejectReconstructionResponse,
    RECONSTRUCTIONS_QUERY, PublishReconstructionResponse, PublishReconstructionVariables, PUBLISH_RECONSTRUCTION_MUTATION
} from "../../graphql/reconstruction";
import {errorNotification} from "../common/NotificationHelper";
import {ReconstructionAction} from "../../models/reconstructionAction";
import {ReconstructionActionButton} from "../common/ReconstructionAction";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {AtlasReconstructionStatus} from "../../models/atlasReconstructionStatus";
import {useAppLayout} from "../../hooks/useAppLayout";

export const ReviewActions = ({reconstruction}: { reconstruction: Reconstruction }) => {
    const clipboard = useClipboard();
    const appLayout = useAppLayout();

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
            onError: (e) => errorNotification("Error Publishing Reconstruction", e.message)
        });

    if (!reconstruction) {
        return <NoSelection/>;
    }

    const variables = {variables: {reconstructionId: reconstruction.id}};

    let peerReviewButton = null;
    let approveButton = null;
    let publishButton = null;

    let moreThanReject = false;

    const rejectButtons = <ReconstructionActionButton action={ReconstructionAction.Reject} onClick={() => rejectAnnotation(variables)}/>

    if (reconstruction.status == ReconstructionStatus.PublishReview && reconstruction?.atlasReconstruction?.status == AtlasReconstructionStatus.ReadyToProcess) {
        approveButton = <ReconstructionActionButton action={ReconstructionAction.ApprovePublish}
                                                    onClick={() => approveAnnotation({
                                                        variables: {
                                                            reconstructionId: reconstruction.id,
                                                            targetStatus: ReconstructionStatus.Approved
                                                        }
                                                    })}/>;
        moreThanReject = true;
    }

    if (reconstruction.status == ReconstructionStatus.PeerReview) {
        peerReviewButton =
            <ReconstructionActionButton action={ReconstructionAction.ApprovePeer}
                                        onClick={() => approveAnnotation({
                                            variables: {
                                                reconstructionId: reconstruction.id,
                                                targetStatus: ReconstructionStatus.PublishReview
                                            }
                                        })}/>;
        moreThanReject = true;
    }

    if (reconstruction.status == ReconstructionStatus.ReadyToPublish) {
        publishButton = <ReconstructionActionButton action={ReconstructionAction.Publish}
                                                    onClick={() => publishReconstruction({variables: {reconstructionId: reconstruction.id}})}/>;
        moreThanReject = true;
    }

    const actions = <Group justify="flex-end">
        {rejectButtons}
        {moreThanReject ? <Divider orientation="vertical"/> : null}
        {approveButton}
        {peerReviewButton}
        {publishButton}
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
