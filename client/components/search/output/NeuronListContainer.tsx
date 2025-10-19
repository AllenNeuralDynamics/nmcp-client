import * as React from "react";
import {observer} from "mobx-react-lite";
import {ActionIcon, Center, Group, Menu, SimpleGrid, Stack, Text} from "@mantine/core";
import {IconChevronLeft, IconDownload, IconExclamationCircle} from "@tabler/icons-react";

import {requestExport} from "../../../services/exportService";
import {DrawerState} from "../../../viewmodel/appLayout";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";
import {NeuronTable} from "./NeuronTable";
import {errorNotification, infoNotification} from "../../common/NotificationHelper";
import {ExportFormat} from "../../../models/neuron";

export const NeuronListContainerWidth = "450px";

const exportLimit = 10;

export const NeuronListContainer = observer(({maxHeight}: { maxHeight: number }) => {
    const appLayout = useAppLayout();

    const queryResponse = useQueryResponseViewModel();

    async function exportNeurons(ids: string[], format: ExportFormat) {
        if (ids.length === 0) {
            return;
        }

        infoNotification("Export Requested", "A download will being when the data is ready.");

        if (!await requestExport(ids, format)) {
            errorNotification("Export Failed", "Additional details are not available.");
        }
    }

    const neurons = queryResponse.neuronViewModels.filter(v => v.isSelected);

    const ids = neurons.map(n => n.ReconstructionId);

    let exportMenu = (
        <Menu disabled={ids.length == 0}>
            <Menu.Target>
                <IconDownload size={22}/>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item onClick={() => exportNeurons(ids, ExportFormat.SWC)}>
                    Export SWC
                </Menu.Item>
                <Menu.Item onClick={() => exportNeurons(ids, ExportFormat.JSON)}>
                    Export JSON
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    if (ids.length > exportLimit) {
        exportMenu = (
            <Menu>
                <Menu.Target>
                    <IconDownload size={22}/>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item>
                        <Group gap={2}><IconExclamationCircle size={12} color="red"/>{`Export is limited to ${exportLimit} selected neurons at one time`}</Group>
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        );
    }

    const renderedHeader = (
        <SimpleGrid p={8} cols={3} bg="section" style={{height: "40px"}}>
            {exportMenu}
            <Text ta="center">Neurons</Text>
            <Group justify="end">
                <ActionIcon variant="subtle" onClick={() => appLayout.setNeuronDrawerState(DrawerState.Hidden)}>
                    <IconChevronLeft size={22}/>
                </ActionIcon>
            </Group>
        </SimpleGrid>
    );

    const table = queryResponse.queryTime < 0 ? <Center p={8}><Text size="sm" c="dimmed">Perform a query to view matching neurons</Text></Center> :
        <NeuronTable/>;

    return (
        // h and mah are not in units of pixels, however the maxHeight prop is.
        <Stack gap={0} w={NeuronListContainerWidth} style={{height: maxHeight, maxHeight: maxHeight}}>
            {renderedHeader}
            <div style={{order: 1, flexGrow: 1, overflow: "auto"}}>
                {table}
            </div>
        </Stack>
    );
});
