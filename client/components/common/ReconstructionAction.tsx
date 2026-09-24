import * as React from "react";
import {Box, Button, Tooltip} from "@mantine/core";
import {
    IconBook,
    IconCheck,
    IconCircleOff,
    IconEdit,
    IconFlagExclamation,
    IconFolderOpen,
    IconGitBranch,
    IconPencilPause,
    IconRefresh,
    IconRotateClockwise,
    IconUserEdit,
    IconX
} from "@tabler/icons-react";

import {actionColor, actionName, actionTooltip, ReconstructionAction} from "../../models/reconstructionAction";

function icon(action: ReconstructionAction, size: number = 18): React.JSX.Element {
    switch (action) {
        case ReconstructionAction.Open:
            return <IconEdit size={size}/>
        case ReconstructionAction.Reopen:
            return <IconFolderOpen size={size}/>
        case ReconstructionAction.Hold:
            return <IconPencilPause size={size}/>
        case ReconstructionAction.RequestPeerReview:
            return <IconUserEdit size={size}/>
        case ReconstructionAction.RequestPublishReview:
            return <IconBook size={size}/>
        case ReconstructionAction.ApprovePeer:
            return <IconCheck size={size}/>
        case ReconstructionAction.ApprovePublish:
            return <IconCheck size={size}/>
        case ReconstructionAction.Publish:
            return <IconBook size={size}/>
        case ReconstructionAction.Reject:
            return <IconX size={size}/>
        case ReconstructionAction.Discard:
            return <IconX size={size}/>
        case ReconstructionAction.ReportIssue:
            return <IconFlagExclamation size={size}/>
        case ReconstructionAction.CreateRevision:
            return <IconGitBranch size={size}/>
        case ReconstructionAction.MarkUntraceable:
            return <IconCircleOff size={size}/>
        case ReconstructionAction.RetryPhase:
            return <IconRefresh size={size}/>
        case ReconstructionAction.ResetPipeline:
            return <IconRotateClockwise size={size}/>
    }
}

type ReconstructionActionButtonProps = {
    action: ReconstructionAction;
    children?: React.JSX.Element | string;
    tooltip?: boolean;
    iconSize?: number;
    disabled?: boolean;

    onClick?(): void
};

export const ReconstructionActionButton = ({action, iconSize, children, tooltip, disabled, onClick}: ReconstructionActionButtonProps) => {
    const onModifiedClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        if (onClick) {
            onClick();
        }
    };

    const button = <Button variant="light" leftSection={icon(action, iconSize ?? 18)} color={actionColor(action)} disabled={disabled}
                           onClick={onModifiedClick}>{children ?? actionName(action)}</Button>;

    if (typeof tooltip == "boolean" && tooltip == false) {
        return button;
    }

    // A disabled button emits no pointer events, so the tooltip needs a live element to attach to.
    const wrapped = disabled ? <Box display="inline-block">{button}</Box> : button;

    return <Tooltip label={actionTooltip(action)}>{wrapped}</Tooltip>;
}
