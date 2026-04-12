import * as React from "react";
import {Card, Table, Text} from "@mantine/core";

import {QualityControlTest, QualityControlTestKind} from "../../models/qualityControl";

export const QualityControlTestTable = ({tests, kind}: { tests: QualityControlTest[], kind: QualityControlTestKind }) => {
    if (!tests || tests.length === 0) {
        return;
    }

    const color = kind == QualityControlTestKind.Passed ? "green.8" : (kind == QualityControlTestKind.Error ? "red.8" : "yellow.8");
    const name = kind == QualityControlTestKind.Passed ? "Passed" : (kind == QualityControlTestKind.Error ? "Errors" : "Warnings");

    return (
        <Card withBorder>
            <Card.Section bg={color} p={8}>
                <Text fw={500}>{name}</Text>
            </Card.Section>
            <Card.Section>
                <Table>
                    <Table.Thead bg="table-header">
                        <Table.Tr>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Description</Table.Th>
                            {kind != QualityControlTestKind.Passed ? <Table.Th>Affected Nodes</Table.Th> : null}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody bg="table">
                        {tests.map((issue, idx) => (
                            <Table.Tr key={idx}>
                                <Table.Td>{issue.name}</Table.Td>
                                <Table.Td>{issue.description}</Table.Td>
                                {kind != QualityControlTestKind.Passed ? <Table.Td>{issue.nodes.length}</Table.Td> : null}
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Card.Section>
        </Card>
    );
}