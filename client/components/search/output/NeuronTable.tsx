import * as React from "react";
import {Link} from "react-router-dom";
import {observer} from "mobx-react-lite";
import {ActionIcon, Button, ColorPicker, ColorSwatch, Divider, Group, Popover, Stack, Table, Text, Tooltip} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {IconInfoCircle, IconSquare, IconSquareCheck} from "@tabler/icons-react";

import {useQueryResponseViewModel} from "../../../hooks/useQueryResponseViewModel";
import {useConstants} from "../../../hooks/useConstants";
import {getViewMode, NEURON_VIEW_MODES} from "../../../viewmodel/neuronViewMode";
import {NeuronViewModel} from "../../../viewmodel/neuronViewModel";
import {NeuronViewModelModal} from "./NeuronViewModelModal";
import {Dropdown} from "../../common/Dropdown";

const swatches = ['#2e2e2e', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14'];

type  NeuronRowProps = {
    neuronViewModel: NeuronViewModel;
}

const isShownIcon = <IconSquareCheck size={14}/>;
const notShownIcon = <IconSquare size={14}/>;

export function isSelectedIcon(isSelected: boolean) {
    return isSelected ? isShownIcon : notShownIcon;
}

const viewModeNames = NEURON_VIEW_MODES.map(n => n.id);

export const NeuronRow = observer((props: NeuronRowProps) => {
    const v = props.neuronViewModel;

    const constants = useConstants();

    // The soma node carries the automatically assigned structure; the neuron carries the manual (curated) assignment.
    const somaAcronym = v.soma ? constants.AtlasConstants.findStructure(v.soma.atlasStructureId)?.acronym ?? null : null;
    const neuronAcronym = v.neuron.atlasStructure?.acronym ?? null;

    const structureAcronym = neuronAcronym ?? somaAcronym ?? "unknown";

    const hasStructureConflict = neuronAcronym !== null && somaAcronym !== null && neuronAcronym !== somaAcronym;

    return (
        <Table.Tr>
            <Table.Td>
                <ActionIcon variant="transparent" onClick={() => v.isSelected = !v.isSelected}>
                    {isSelectedIcon(v.isSelected)}
                </ActionIcon>
            </Table.Td>
            <Table.Td>
                <Popover>
                    <Popover.Target>
                        <ColorSwatch size={20} color={v.baseColor}/>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <ColorPicker size={"sm"} format="hex" value={v.baseColor} swatches={swatches} onChange={(color: string) => v.baseColor = color}/>
                    </Popover.Dropdown>
                </Popover>
            </Table.Td>
            <Table.Td style={{verticalAlign: "middle"}}>
                <Dropdown data={viewModeNames} value={props.neuronViewModel.viewMode.id}
                          onChange={(value) => {
                              v.viewMode = getViewMode(value);
                          }}/>
            </Table.Td>

            <Table.Td ta="center">
                <ActionIcon variant="transparent" onClick={() => v.isMirrored = !v.isMirrored}>
                    {isSelectedIcon(v.isMirrored)}
                </ActionIcon>
            </Table.Td>
            <Table.Td style={{verticalAlign: "middle"}}>
                <Stack gap={0}>
                    <Link to={`/neuron/${v.neuron.id}`}>{v.Label}</Link>
                    <Text size="xs" c="dimmed">{v.neuron.specimen.label}</Text>
                </Stack>
            </Table.Td>
            <Table.Td>
                <Group gap={4} justify="space-between" wrap="nowrap">
                    <Text size="sm">{structureAcronym}</Text>
                    {hasStructureConflict ? (
                        <Tooltip label={
                            <Stack gap={0}>
                                <Text size="xs">{`Automatic soma location: ${somaAcronym}`}</Text>
                                <Text size="xs">{`Manual soma location: ${neuronAcronym}`}</Text>
                            </Stack>
                        }>
                            <Text component="span" c="dimmed" style={{display: "flex"}}>
                                <IconInfoCircle size={14}/>
                            </Text>
                        </Tooltip>
                    ) : null}
                </Group>
            </Table.Td>
        </Table.Tr>
    );
});

export const NeuronTable = observer(() => {
    const [opened, {open, close}] = useDisclosure(false);

    const queryViewModel = useQueryResponseViewModel();

    if (!queryViewModel.neuronViewModels || queryViewModel.neuronViewModels.length === 0) {
        return null;
    }

    const areAllNeuronsSelected = queryViewModel.areAllNeuronsSelected;

    const sameColor = queryViewModel.neuronsSameColor;

    const pickerColor = sameColor ?? "rgba(128, 128, 128, 0.1";

    const rows: any = queryViewModel.neuronViewModels.map((v) => <NeuronRow key={`trf_${v.neuron.id}`} neuronViewModel={v}/>);

    return (
        <Table>
            <NeuronViewModelModal opened={opened} close={close}/>
            <Table.Thead>
                <Table.Tr bg="table-header">
                    <Table.Th>
                        <ActionIcon variant="transparent" onClick={() => queryViewModel.areAllNeuronsSelected = !areAllNeuronsSelected}>
                            {isSelectedIcon(areAllNeuronsSelected)}
                        </ActionIcon>
                    </Table.Th>
                    <Table.Th>
                        <Popover>
                            <Popover.Target>
                                <ColorSwatch size={20} color={pickerColor}/>
                            </Popover.Target>
                            <Popover.Dropdown>
                                <Stack align="center">
                                    <Text size="sm" c="dimmed">Change color of selected neurons</Text>
                                    <ColorPicker size={"sm"} format="hex" value={pickerColor} swatches={swatches}
                                                 onChange={(color: string) => queryViewModel.neuronsSameColor = color}/>
                                    <Divider label="or" orientation="horizontal"/>
                                    <Tooltip label="This will affect all neurons including unselected.">
                                        <Button variant="subtle" size="xs" onClick={() => queryViewModel.resetColors()}>Reset to default colors</Button>
                                    </Tooltip>
                                </Stack>
                            </Popover.Dropdown>
                        </Popover>
                    </Table.Th>
                    <Table.Th>
                        <Text size="sm" td="underline" c="blue" onClick={() => open()}>View Mode</Text>
                    </Table.Th>
                    <Table.Th> Mirror </Table.Th>
                    <Table.Th>Neuron</Table.Th>
                    <Table.Th>Structure</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody bg="table">
                {rows}
            </Table.Tbody>
        </Table>
    );
});
