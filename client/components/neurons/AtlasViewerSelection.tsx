import * as React from "react";
import {useRef, useState} from "react";
import {observer} from "mobx-react-lite";
import {Accordion, Anchor, Stack, Table, Tooltip} from "@mantine/core";
import {useMouse} from "@mantine/hooks";

import {useConstants} from "../../hooks/useConstants";
import {useAppLayout} from "../../hooks/useAppLayout";
import {useUIQuery} from "../../hooks/useUIQuery";
import {useAtlas} from "../../hooks/useAtlas";
import {AtlasNode} from "../../models/atlasNode";

// Small table-padding (compact tables)
const stp: number = 8;

export const AtlasViewerSelection = observer(({node, onClick}: { node: AtlasNode, onClick: (id: number) => void }) => {
    const [top, setTop] = useState<number>(200);
    const [left, setLeft] = useState<number>(10);
    const {x, y} = useMouse();

    const isTrackingRef = useRef<boolean>(false);
    const startTopRef = useRef<number>(0);
    const startLeftRef = useRef<number>(0);
    const startMouseRef = useRef<{ x: number, y: number }>({x: 0, y: 0});

    const constants = useConstants();
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
        const structureLabel = displayStructure ? (
            <Tooltip zIndex={2000} label={atlasStructure.name}>
                <Anchor size="sm" onClick={() => {onClick(displayStructure.structureId)}}>
                    {`${atlasStructure.acronym}`}
                </Anchor>
            </Tooltip>
        ) : null;

        return (
            <Stack gap={0}>
                <Table variant="vertical" withColumnBorders>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Th p={stp} bg="table-header">Node Structure</Table.Th>
                            <Table.Td p={stp}>{structureLabel}</Table.Td>
                        </Table.Tr>
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
