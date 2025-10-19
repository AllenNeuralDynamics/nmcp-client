import * as React from "react";
import {Badge, Tooltip} from "@mantine/core";

import {ReconstructionStatus, statusColor, statusName} from "../../models/reconstructionStatus";
import {Reconstruction} from "../../models/reconstruction";

export const ReconstructionStatusLabel = ({reconstructions}: { reconstructions: Reconstruction | Reconstruction[] }) => {
    if (reconstructions === null || reconstructions === undefined) {
        return null;
    }

    let status = ReconstructionStatus.Multiple;
    let secondary = null;
    let check: Reconstruction = null;

    if (Array.isArray(reconstructions)) {
        if (reconstructions.length == 0) {
            return null;
        }

        if (reconstructions.length == 1 || reconstructions.every(r => r.status == reconstructions[0].status)) {
            status = reconstructions[0].status;
            check = reconstructions[0];
        }
    } else {
        status = reconstructions.status;
        check = reconstructions;
        secondary = reconstructions.atlasReconstruction.status;
    }

    const name = statusName(status, secondary);

    return <Tooltip label={name}><Badge variant="light" color={statusColor(status)}>{name}</Badge></Tooltip>;
}
