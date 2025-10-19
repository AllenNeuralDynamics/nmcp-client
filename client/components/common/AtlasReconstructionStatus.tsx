import * as React from "react";
import {Badge} from "@mantine/core";

import {Reconstruction} from "../../models/reconstruction";
import {AtlasReconstructionStatus, statusColor, atlasStatusName} from "../../models/atlasReconstructionStatus";

export const AtlasReconstructionStatusLabel = ({reconstructions}: { reconstructions: Reconstruction | Reconstruction[] }) => {
    if (reconstructions === null || reconstructions === undefined) {
        return null;
    }

    let status = AtlasReconstructionStatus.Multiple;

    if (Array.isArray(reconstructions)) {
        if (reconstructions.length == 0) {
            return null;
        }

        if (reconstructions.length == 1 || reconstructions.every(r => r.atlasReconstruction.status == reconstructions[0].atlasReconstruction.status)) {
            status = reconstructions[0].atlasReconstruction.status;
        }
    } else {
        status = reconstructions.atlasReconstruction.status;
    }

    return <Badge variant="light" color={statusColor(status)}>{atlasStatusName(status)}</Badge>;
}
