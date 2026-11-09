import * as React from "react";
import {Card, SimpleGrid, Stack, Text} from "@mantine/core";

import {QualityControlTestKind, QualityOutputV2} from "../../models/qualityControl";
import {QualityControlTestTable} from "./QualityControlTestTable";

// A fragment, not a container: the card and grid are laid out as direct children of the section's Stack.
export const QualityControlOutputV2 = ({output}: { output: QualityOutputV2 }) => {
    const hasErrors = output.errors.length > 0;
    const hasWarnings = output.warnings.length > 0;
    const hasPassed = output.passed.length > 0;

    return (
        <>
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
        </>
    );
}
