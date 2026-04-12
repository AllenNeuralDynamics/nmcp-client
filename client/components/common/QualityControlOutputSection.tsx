import * as React from "react";
import {Card, Group, SimpleGrid, Stack, Text} from "@mantine/core";

import {QualityControlTestKind, QualityOutput} from "../../models/qualityControl";
import {QualityControlTestTable} from "./QualityControlTestTable";

export const QualityControlOutputSection = ({output}: { output: QualityOutput }) => {
    const hasErrors = output.errors?.length > 0;
    const hasWarnings = output.warnings?.length > 0;
    const hasPassed = output.passed?.length > 0;

    return (
        <Stack gap="md">
            <Group gap="xs">
                <Text size="sm" c="dimmed">Standard Morph version: {output.toolVersion}</Text>
            </Group>
            {output.toolError ? (
                <Card withBorder>
                    <Card.Section bg="red.4" p={8}>
                        <Text fw={500}>Tool Error: {output.toolError.kind}</Text>
                    </Card.Section>
                    <Card.Section p={12}>
                        <Stack gap="xs">
                            <Text size="sm">{output.toolError.description}</Text>
                            {output.toolError.info ? <Text size="xs" c="dimmed">{output.toolError.info}</Text> : null}
                        </Stack>
                    </Card.Section>
                </Card>
            ) : null}
            <SimpleGrid cols={3}>
                {hasPassed ? <QualityControlTestTable tests={output.passed} kind={QualityControlTestKind.Passed}/> : null}
                {hasErrors ? <QualityControlTestTable tests={output.errors} kind={QualityControlTestKind.Error}/> : null}
                {hasWarnings ? <QualityControlTestTable tests={output.warnings} kind={QualityControlTestKind.Warning}/> : null}
            </SimpleGrid>
        </Stack>
    );
}