import * as React from "react";
import {Button, Tooltip} from "@mantine/core";

import {actionColor, actionName, actionTooltip, ReconstructionAction} from "../../models/reconstructionAction";
import {IconBook, IconEdit, IconFlagExclamation, IconFolderOpen, IconPencilPause, IconUserEdit, IconX} from "@tabler/icons-react";

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
        case ReconstructionAction.Reject:
            return <IconX size={size}/>
        case ReconstructionAction.Discard:
            return <IconX size={size}/>
        case ReconstructionAction.ReportIssue:
            return <IconFlagExclamation size={size}/>
    }
}

type ReconstructionActionButtonProps = {
    action: ReconstructionAction;
    children?: React.JSX.Element | string;
    tooltip?: boolean;
    iconSize?: number;

    onClick?(): void
};

export const ReconstructionActionButton = ({action, iconSize, children, tooltip, onClick}: ReconstructionActionButtonProps) => {
    const onModifiedClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();
        if (onClick) {
            onClick();
        }
    };

    const button = <Button variant="light" leftSection={icon(action, iconSize ?? 18)} color={actionColor(action)}
                           onClick={onModifiedClick}>{children ?? actionName(action)}</Button>;

    if (typeof tooltip == "boolean" && tooltip == false) {
        return button;
    }

    return <Tooltip label={actionTooltip(action)}>{button}</Tooltip>;
}
