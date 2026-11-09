import * as React from "react";
import {Group, Text} from "@mantine/core";

type QualityOutputHeaderProps = {
    // The caller's status badge, first at the left, followed by the tool version.
    leading?: React.ReactNode;
    toolVersion: string;
    // Version-specific controls, at the right.
    controls?: React.ReactNode;
    // The caller's actions, at the far right after the controls.
    trailing?: React.ReactNode;
}

export const QualityOutputHeader = ({leading, toolVersion, controls, trailing}: QualityOutputHeaderProps) => {
    return (
        <Group justify="space-between" wrap="nowrap">
            <Group gap="sm">
                {leading}
                <Text size="sm" c="dimmed">Standard Morph version: {toolVersion}</Text>
            </Group>
            {controls || trailing ? <Group gap="md" wrap="nowrap">{controls}{trailing}</Group> : null}
        </Group>
    );
}
