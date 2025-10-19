import * as React from "react";
import {useRef, useState} from "react";
import {observer} from "mobx-react-lite";
import {Accordion, Anchor, Divider, Group, Space, Stack, Table, Text, Tooltip} from "@mantine/core";
import {useMouse} from "@mantine/hooks";

import {useConstants} from "../../../hooks/useConstants";
import {useAtlas} from "../../../hooks/useAtlas";
import {NodeStructureKind} from "../../../models/structureIdentifier";
import {useUIQuery} from "../../../hooks/useUIQuery";
import {useAppLayout} from "../../../hooks/useAppLayout";
import {NeuronViewModel} from "../../../viewmodel/neuronViewModel";
import {AtlasNode} from "../../../models/atlasNode";

// Small table-padding (compact tables)
const stp: number = 4;

export const ViewerSelection = observer(({neuron, node}: { neuron: NeuronViewModel, node: AtlasNode }) => {
    const [top, setTop] = useState<number>(80);
    const [left, setLeft] = useState<number>(10);
    const {x, y} = useMouse();

    const isTrackingRef = useRef<boolean>(false);
    const startTopRef = useRef<number>(0);
    const startLeftRef = useRef<number>(0);
    const startMouseRef = useRef<{ x: number, y: number }>({x: 0, y: 0});

    const constants = useConstants();
    const appLayout = useAppLayout();
    const uiQuery = useUIQuery();
    const atlas = useAtlas();

    if (!node) {
        return;
    }

    const lookupStructureIdentifier = (id: string) => {
        return constants.findStructureIdentifier(id);
    };

    const lookupStructure = (id: string | number) => {
        return constants.AtlasConstants.findStructure(id);
    };

    const renderSelection = () => {
        const atlasStructure = lookupStructure(node.atlasStructureId);

        let displayStructure = atlasStructure;

        if (displayStructure) {
            while (!displayStructure.hasGeometry) {
                displayStructure = lookupStructure(displayStructure.parentStructureId);
            }
        }

        const structure = lookupStructureIdentifier(node.nodeStructureId);

        const position = {
            x: node.x,
            y: node.y,
            z: node.z
        };

        let somaStructureLabel = null;

        if (structure.swcValue !== NodeStructureKind.soma && neuron && neuron.soma) {
            const somaStructure = lookupStructure(neuron.soma.atlasStructureId);

            let somaDisplayStructure = somaStructure;

            if (somaDisplayStructure) {
                while (!somaDisplayStructure.hasGeometry) {
                    somaDisplayStructure = lookupStructure(somaDisplayStructure.parentStructureId);
                }
            }

            somaStructureLabel = somaStructure ? (
                <Tooltip zIndex={2000} label={somaStructure.name}>
                    <Anchor size="sm" onClick={() => atlas.toggle(somaDisplayStructure.id)}>
                        {` ${somaStructure.acronym}`}
                    </Anchor>
                </Tooltip>
            ) : null;
        }

        const structureLabel = displayStructure ? (
            <Tooltip zIndex={2000} label={atlasStructure.name}>
                <Anchor size="sm" onClick={() => atlas.toggle(displayStructure.id)}>
                    {`${atlasStructure.acronym}`}
                </Anchor>
            </Tooltip>
        ) : null;

        return (
            <Stack gap={0}>
                <Stack gap={0}>
                    <Group gap={0} justify="space-between">
                        <Group>
                            <Table variant="vertical" withColumnBorders>
                                <Table.Tbody>
                                    <Table.Tr>
                                        <Table.Th p={stp} bg="table-header">Neuron</Table.Th>
                                        <Table.Td p={stp}>
                                            <Group gap={4} align="baseline">
                                                <Text size="sm">{neuron.Label}</Text>
                                                <Text size="xs" c="dimmed">{neuron.neuron.specimen.label}</Text>
                                            </Group></Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Th p={stp} bg="table-header">Node Structure</Table.Th>
                                        <Table.Td p={stp}>{structureLabel}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Th p={stp} bg="table-header">Soma Structure</Table.Th>
                                        <Table.Td p={stp}>{somaStructureLabel}</Table.Td>
                                    </Table.Tr>
                                </Table.Tbody>
                            </Table>
                        </Group>
                        <Divider orientation="vertical"/>
                        <Space style={{flexGrow: 1}} w={1}/>
                        <Divider orientation="vertical"/>
                        <Group>
                            <Table variant="vertical" withColumnBorders>
                                <Table.Tbody>
                                    <Table.Tr>
                                        <Table.Th p={stp} bg="table-header">X</Table.Th>
                                        <Table.Td p={stp}>{node.x.toFixed(1)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Th p={stp} bg="table-header">Y</Table.Th>
                                        <Table.Td p={stp}>{node.y.toFixed(1)}</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Th p={stp} bg="table-header">Z</Table.Th>
                                        <Table.Td p={stp}>{node.z.toFixed(1)}</Table.Td>
                                    </Table.Tr>
                                </Table.Tbody>
                            </Table>
                        </Group>
                    </Group>
                </Stack>
                <Divider orientation="horizontal"/>
                <Tooltip zIndex={2000} label="Replace the existing query, or add a new predicate, that uses a search region of 1000µm around this node.">
                    <Group p={4} gap={2}>
                        <Anchor size="sm" onClick={() => {
                            uiQuery.createCustomRegionPredicate(position, true);
                            appLayout.isQueryExpanded = true;
                        }}>Replace</Anchor>
                        <Text size="sm">query with custom region</Text>
                        <Text size="sm">or</Text>
                        <Anchor size="sm" onClick={() => {
                            uiQuery.createCustomRegionPredicate(position, false);
                            appLayout.isQueryExpanded = true;
                        }}>add</Anchor>
                    </Group>
                </Tooltip>
            </Stack>
        );
    };

    const onMouseDown = (e: React.MouseEvent) => {
        isTrackingRef.current = true;
        startLeftRef.current = left;
        startTopRef.current = top;
        startMouseRef.current = {x: x, y: y};
    };

    const onMouseUp = () => {
        isTrackingRef.current = false;
    };

    const onMouseMove = (evt: React.MouseEvent) => {
        if (isTrackingRef.current) {
            setTop(Math.max(startTopRef.current + (y - startMouseRef.current.y), 0));
            setLeft(Math.max(startLeftRef.current + (x - startMouseRef.current.x), 0));
        }
    };

    const renderPalette = () => {
        return (
            <Accordion variant="contained" defaultValue="any" chevronIconSize={12}>
                <Accordion.Item value="any">
                    <Accordion.Control bg="segment" styles={{label: {padding: 2}}}>
                        <Stack onClick={(e) => e.stopPropagation()}>
                            Selected Node
                        </Stack>
                    </Accordion.Control>
                    <Accordion.Panel styles={{content: {padding: 0}}}>
                        {renderSelection()}
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        )
    };

    return (
        <div style={{
            height: "auto",
            position: "absolute",
            top: top + "px",
            left: left + "px",
            width: "auto",
            opacity: 0.9,
            zIndex: 1000
        }} onMouseDown={(e) => onMouseDown(e)} onMouseUp={() => onMouseUp()}
             onMouseMove={(evt) => onMouseMove(evt)}>
            {renderPalette()}
        </div>
    );
});
