import * as React from "react";
import {useEffect, useState} from "react";
import {useMutation} from "@apollo/client";
import {Badge, Button, Group, Menu, Stack, Text} from "@mantine/core";
import {useClipboard} from "@mantine/hooks";
import {IconChevronDown, IconFolderX, IconGitMerge} from "@tabler/icons-react";

import {Reconstruction} from "../../models/reconstruction";
import {
    DISCARD_RECONSTRUCTION_MUTATION,
    DiscardReconstructionResponse,
    MARK_DUPLICATE_MUTATION,
    MARK_INCOMPLETE_MUTATION,
    MARK_UNTRACEABLE_MUTATION,
    MarkDuplicateResponse,
    MarkIncompleteResponse,
    MarkUntraceableResponse,
    PAUSE_RECONSTRUCTION_MUTATION,
    PauseReconstructionResponse,
    ReconstructionStatusModifierArgs,
    RESUME_RECONSTRUCTION_MUTATION,
    ResumeReconstructionResponse,
    RECONSTRUCTIONS_QUERY
} from "../../graphql/reconstruction";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {actionColor, actionName, actionTooltip, ReconstructionAction} from "../../models/reconstructionAction";
import {gateFor} from "../../models/reconstructionGates";
import {actionIcon, ReconstructionActionButton} from "../common/ReconstructionAction";
import {ReconstructionStatusLabel} from "../common/ReconstructionStatus";
import {errorNotification} from "../common/NotificationHelper";
import {MessageBox} from "../common/MessageBox";
import {useAppLayout} from "../../hooks/useAppLayout";
import {useUser} from "../../hooks/useUser";
import {CreateRevisionPopover} from "./CreateRevisionPopover";

export type ReconstructionPanelProps = {
    reconstruction: Reconstruction;
    userId: string;

    showRequestReviewDialog(id: string, status: ReconstructionStatus): void;
}

type CloseItem = {
    action: ReconstructionAction;
    title: string;

    close(reconstructionId: string): Promise<unknown>;
};

type PendingClose = {
    action: ReconstructionAction;
    reconstructionId: string;
};

type ReviewItem = {
    action: ReconstructionAction;
    label: string;
    target: ReconstructionStatus;
};

const reviewItems: ReviewItem[] = [
    {action: ReconstructionAction.RequestPeerReview, label: "Peer Review...", target: ReconstructionStatus.PeerReview},
    {action: ReconstructionAction.RequestPublishReview, label: "Publish Review...", target: ReconstructionStatus.PublishReview}
];

export const ReconstructionActions = (props: ReconstructionPanelProps) => {
    const clipboard = useClipboard();
    const appLayout = useAppLayout();
    const user = useUser();

    const [pauseReconstruction] = useMutation<PauseReconstructionResponse, ReconstructionStatusModifierArgs>(PAUSE_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error Holding Reconstruction", e.message)
        });

    const [markIncomplete] = useMutation<MarkIncompleteResponse, ReconstructionStatusModifierArgs>(MARK_INCOMPLETE_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error Marking Reconstruction Incomplete", e.message)
        });

    const [markDuplicate] = useMutation<MarkDuplicateResponse, ReconstructionStatusModifierArgs>(MARK_DUPLICATE_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error Marking Reconstruction as a Duplicate", e.message)
        });

    const [resumeReconstruction] = useMutation<ResumeReconstructionResponse, ReconstructionStatusModifierArgs>(RESUME_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error Reopening Reconstruction", e.message)
        });

    const [discardReconstruction] = useMutation<DiscardReconstructionResponse, ReconstructionStatusModifierArgs>(DISCARD_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error Discarding Reconstruction", e.message)
        });

    const [markUntraceable] = useMutation<MarkUntraceableResponse, ReconstructionStatusModifierArgs>(MARK_UNTRACEABLE_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => errorNotification("Error Marking Reconstruction Untraceable", e.message)
        });

    const [pendingClose, setPendingClose] = useState<PendingClose>(null);

    // Keyed on the id: the reconstructions query polls, replacing the object every few seconds.  A poll can also drop
    // the selected row, unmounting the confirmation without cancelling it, so a confirmation whose reconstruction left
    // the selection is retired here rather than returning when the row does.
    useEffect(() => setPendingClose(null), [props.reconstruction?.id]);

    if (props.reconstruction == null) {
        return (<NoReconstruction/>);
    }

    const reconstruction = props.reconstruction;

    const variables = {variables: {reconstructionId: reconstruction.id}};

    const gate = (action: ReconstructionAction) => gateFor(action, {
        area: "annotator",
        status: reconstruction.status,
        childStatus: reconstruction.atlasReconstruction?.status,
        permissions: user?.permissions ?? 0,
        annotatorId: reconstruction.annotatorId,
        userId: props.userId
    });

    const actionButton = (action: ReconstructionAction, onClick: () => void) => {
        const g = gate(action);

        return g.visible ? <ReconstructionActionButton action={action} disabled={!g.enabled} onClick={onClick}/> : null;
    };

    const closeGroups: CloseItem[][] = [
        [
            {action: ReconstructionAction.Hold, title: "Hold Reconstruction?", close: id => pauseReconstruction({variables: {reconstructionId: id}})}
        ],
        [
            {action: ReconstructionAction.Discard, title: "Discard Reconstruction?", close: id => discardReconstruction({variables: {reconstructionId: id}})}
        ],
        [
            {action: ReconstructionAction.MarkIncomplete, title: "Mark Reconstruction Incomplete?", close: id => markIncomplete({variables: {reconstructionId: id}})},
            {action: ReconstructionAction.MarkDuplicate, title: "Mark Reconstruction as a Duplicate?", close: id => markDuplicate({variables: {reconstructionId: id}})},
            {action: ReconstructionAction.MarkUntraceable, title: "Mark Neuron Untraceable?", close: id => markUntraceable({variables: {reconstructionId: id}})}
        ]
    ];

    const visibleCloseGroups = closeGroups.map(g => g.filter(i => gate(i.action).visible)).filter(g => g.length > 0);

    const visibleReviewItems = reviewItems.filter(i => gate(i.action).visible);

    const anyEnabled = (items: { action: ReconstructionAction }[]) => items.some(i => gate(i.action).enabled);

    // Both menus skip returning focus: Mantine returns it to the target 10 ms after the dropdown closes, which is after
    // the modal an item opens has focused its first control, and would pull focus back out of that modal.
    const closeMenu = visibleCloseGroups.length > 0 ? (
        <Menu returnFocus={false}>
            <Menu.Target>
                <Button variant="light" color="gray" leftSection={<IconFolderX size={18}/>} rightSection={<IconChevronDown size={16}/>}
                        disabled={!anyEnabled(visibleCloseGroups.flat())}>Close...</Button>
            </Menu.Target>
            <Menu.Dropdown>
                {visibleCloseGroups.map((group, index) => (
                    <React.Fragment key={index}>
                        {index > 0 ? <Menu.Divider/> : null}
                        {group.map(item => (
                            <Menu.Item key={item.action} leftSection={actionIcon(item.action)} color={actionColor(item.action)}
                                       disabled={!gate(item.action).enabled}
                                       onClick={() => setPendingClose({action: item.action, reconstructionId: reconstruction.id})}>
                                {actionName(item.action)}
                            </Menu.Item>
                        ))}
                    </React.Fragment>
                ))}
            </Menu.Dropdown>
        </Menu>
    ) : null;

    const requestReviewMenu = visibleReviewItems.length > 0 ? (
        <Menu returnFocus={false}>
            <Menu.Target>
                <Button variant="light" color={actionColor(ReconstructionAction.RequestPeerReview)} leftSection={actionIcon(ReconstructionAction.RequestPeerReview)}
                        rightSection={<IconChevronDown size={16}/>} disabled={!anyEnabled(visibleReviewItems)}>Request Review...</Button>
            </Menu.Target>
            <Menu.Dropdown>
                {visibleReviewItems.map(item => (
                    <Menu.Item key={item.action} leftSection={actionIcon(item.action)} color={actionColor(item.action)}
                               disabled={!gate(item.action).enabled}
                               onClick={() => props.showRequestReviewDialog(reconstruction.id, item.target)}>
                        {item.label}
                    </Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    ) : null;

    // The comparison covers the render before the effect above clears a value left from another selection.
    const pendingItem = pendingClose?.reconstructionId == reconstruction.id ? closeGroups.flat().find(i => i.action == pendingClose.action) : null;

    const onConfirmClose = async () => {
        const reconstructionId = pendingClose.reconstructionId;

        setPendingClose(null);

        await pendingItem.close(reconstructionId);
    };

    const confirmation = pendingItem ? (
        <MessageBox opened={true} centered={true} title={pendingItem.title} message={actionTooltip(pendingItem.action)}
                    confirmText={actionName(pendingItem.action)} onCancel={() => setPendingClose(null)} onConfirm={onConfirmClose}/>
    ) : null;

    const revisePopover = reconstruction.status == ReconstructionStatus.Published ? <CreateRevisionPopover id={reconstruction.id}/> : null;

    const actions = <Group justify="flex-end">
        {closeMenu}
        {actionButton(ReconstructionAction.Reopen, () => resumeReconstruction(variables))}
        {requestReviewMenu}
        {revisePopover}
        {confirmation}
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
