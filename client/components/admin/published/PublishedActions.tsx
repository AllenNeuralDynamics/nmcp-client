import * as React from "react";
import {useState} from "react";
import {Button, Group} from "@mantine/core";
import {IconBook} from "@tabler/icons-react";

import {Reconstruction} from "../../../models/reconstruction";
import {ReconstructionAction} from "../../../models/reconstructionAction";
import {gateFor} from "../../../models/reconstructionGates";
import {ReconstructionActionButton} from "../../common/ReconstructionAction";
import {useUser} from "../../../hooks/useUser";
import {useRetryPhase} from "../../../hooks/useRetryPhase";
import {PublishAllModal} from "./PublishAllModal";
import {StatusFilterType} from "./usePublishedQueueState";

type PublishedActionsProps = {
    reconstructions: Reconstruction[];
    totalCount: number;
    statusFilter: StatusFilterType;
    selected: Reconstruction;
}

export const PublishedActions = ({reconstructions, totalCount, statusFilter, selected}: PublishedActionsProps) => {
    const [isPublishAllOpen, setIsPublishAllOpen] = useState(false);

    const user = useUser();
    const retryPhase = useRetryPhase();

    const retryEnabled = selected != null && gateFor(ReconstructionAction.RetryPhase, {
        area: "published",
        status: selected.status,
        childStatus: selected.atlasReconstruction?.status,
        permissions: user?.permissions ?? 0,
        annotatorId: selected.annotatorId,
        userId: user?.id
    }).enabled;

    // Publish All is a bulk action over the displayed queue rather than a per-reconstruction one, so it is outside
    // gateFor and renders wherever the page lists the ReadyToPublish rows it acts on.
    const publishAll = statusFilter === "publishable" ? <>
        <PublishAllModal open={isPublishAllOpen} reconstructions={reconstructions} totalCount={totalCount} onClose={() => setIsPublishAllOpen(false)}/>
        <Button variant="light" color="green" leftSection={<IconBook size={18}/>} onClick={() => setIsPublishAllOpen(true)}>Publish All...</Button>
    </> : null;

    // The page's Admin gate already satisfies canOperateReconstructionPipeline, so Retry Phase always renders here.
    return (
        <Group p={12} justify="end">
            <ReconstructionActionButton action={ReconstructionAction.RetryPhase} disabled={!retryEnabled} onClick={() => retryPhase(selected)}/>
            {publishAll}
        </Group>
    )
}
