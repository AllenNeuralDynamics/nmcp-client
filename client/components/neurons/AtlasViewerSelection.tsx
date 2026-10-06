import * as React from "react";
import {useRef, useState} from "react";
import {observer} from "mobx-react-lite";
import {Accordion, Anchor, Stack, Table, Text, Tooltip} from "@mantine/core";
import {useMouse} from "@mantine/hooks";

import {AtlasNode} from "../../models/atlasNode";
import {Atlas} from "../../models/atlas";

// Small table-padding (compact tables)
const stp: number = 8;

export const AtlasViewerSelection = observer(({atlas, node, onClick}: { atlas: Atlas, node: AtlasNode, onClick: (id: string) => void }) => {
    const [top, setTop] = useState<number>(200);
    const [left, setLeft] = useState<number>(10);
    const {x, y} = useMouse();

    const isTrackingRef = useRef<boolean>(false);
    const startTopRef = useRef<number>(0);
    const startLeftRef = useRef<number>(0);
    const startMouseRef = useRef<{ x: number, y: number }>({x: 0, y: 0});

    if (!node) {
        return;
    }

    const renderSelection = () => {
        const atlasStructure = atlas.findStructureWithId(node.atlasStructureId);

        const displayStructure = atlasStructure ? atlas.findStructureWithGeometry(atlasStructure) : undefined;

        // A structure with no geometry ancestor (possible under a marmoset root without geometry) has nothing to
        // toggle, so its label is plain text.
        const structureLabel = atlasStructure ? (
            <Tooltip zIndex={2000} label={atlasStructure.name}>
                {displayStructure ? (
                    <Anchor size="sm" onClick={() => {onClick(displayStructure.id)}}>
                        {`${atlasStructure.acronym}`}
                    </Anchor>
                ) : (
                    <Text size="sm" span>{atlasStructure.acronym}</Text>
                )}
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
