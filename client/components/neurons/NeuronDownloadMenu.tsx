import * as React from "react";
import {Button, Menu} from "@mantine/core";
import {IconChevronDown, IconDownload} from "@tabler/icons-react";

import {requestExport} from "../../services/exportService";
import {ExportFormat, ReconstructionSpace} from "../../models/neuron";
import {Reconstruction} from "../../models/reconstruction";
import {errorNotification, infoNotification} from "../common/NotificationHelper";

type NeuronDownloadMenuProps = {
    reconstruction?: Reconstruction;
}

export const NeuronDownloadMenu = ({reconstruction}: NeuronDownloadMenuProps) => {
    // A null node-counts column means node data was never stored, matching the API's own availability test.
    const hasSpecimen = reconstruction?.specimenNodeCounts != null;
    const hasAtlas = reconstruction?.atlasReconstruction?.nodeCounts != null;

    async function download(id: string, format: ExportFormat, space: ReconstructionSpace) {
        infoNotification("Export Requested", "A download will begin when the data is ready.");

        if (!await requestExport([id], format, space)) {
            errorNotification("Export Failed", "Additional details are not available.");
        }
    }

    return (
        <Menu>
            <Menu.Target>
                <Button variant="default" size="xs" disabled={!reconstruction}
                        leftSection={<IconDownload size={16}/>}
                        rightSection={<IconChevronDown size={16}/>}>Download</Button>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item disabled={!hasSpecimen}
                           onClick={() => download(reconstruction.id, ExportFormat.SWC, ReconstructionSpace.Specimen)}>
                    Specimen-Space SWC
                </Menu.Item>
                <Menu.Item disabled={!hasAtlas}
                           onClick={() => download(reconstruction.atlasReconstruction.id, ExportFormat.SWC, ReconstructionSpace.Atlas)}>
                    Atlas-Space SWC
                </Menu.Item>
                <Menu.Item disabled={!hasSpecimen}
                           onClick={() => download(reconstruction.id, ExportFormat.Parquet, ReconstructionSpace.Specimen)}>
                    Specimen-Space Parquet
                </Menu.Item>
                <Menu.Item disabled={!hasAtlas}
                           onClick={() => download(reconstruction.atlasReconstruction.id, ExportFormat.Parquet, ReconstructionSpace.Atlas)}>
                    Atlas-Space Parquet
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
