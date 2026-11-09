import * as React from "react";
import {Stack, Text} from "@mantine/core";

import {
    parseQualityOutputV2,
    parseQualityOutputV3,
    QualityControlServiceVersion,
    QualityOutput,
    SupportedV3ToolMajorVersion,
    toolMajorVersion
} from "../../models/qualityControl";
import {QualityControlOutputV2} from "./QualityControlOutputV2";
import {QualityControlOutputV3} from "./QualityControlOutputV3";
import {QualityOutputHeader} from "./QualityOutputHeader";

type QualityControlOutputSectionProps = {
    output: QualityOutput;
    // The caller's status badge, at the left of the output's header row.
    leading?: React.ReactNode;
    // The caller's actions, at the far right of the header row.
    trailing?: React.ReactNode;
}

export const QualityControlOutputSection = ({output, leading, trailing}: QualityControlOutputSectionProps) => {
    switch (output.serviceVersion) {
        case QualityControlServiceVersion.v01:
        case QualityControlServiceVersion.v02:
            return (
                <Stack gap="md">
                    <QualityOutputHeader leading={leading} toolVersion={output.toolVersion} trailing={trailing}/>
                    <QualityControlOutputV2 output={parseQualityOutputV2(output.data)}/>
                </Stack>
            );
        case QualityControlServiceVersion.v03:
            if (toolMajorVersion(output.toolVersion) === SupportedV3ToolMajorVersion) {
                // The v3 renderer draws its own header row, because its grouping control belongs in it.
                return (
                    <Stack gap="md">
                        <QualityControlOutputV3 output={parseQualityOutputV3(output.data)} toolVersion={output.toolVersion} leading={leading} trailing={trailing}/>
                    </Stack>
                );
            }
            break;
    }

    return (
        <Stack gap="md">
            <QualityOutputHeader leading={leading} toolVersion={output.toolVersion} trailing={trailing}/>
            <Text size="sm" c="dimmed">Quality control content is from a newer version and can't be displayed yet.</Text>
        </Stack>
    );
}
