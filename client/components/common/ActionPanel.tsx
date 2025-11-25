import * as React from "react";
import {Badge, Group, Stack, Text} from "@mantine/core";
import {useAppLayout} from "../../hooks/useAppLayout";
import {useClipboard} from "@mantine/hooks";

export type ActionPanelProps = {
    title: React.ReactNode;
    status?: React.ReactNode;
    id?: string;
    message: React.ReactNode;
    renderIcon: (size: number) => React.ReactNode;
    actions?: React.ReactNode;
    modal?: React.ReactNode;
}

export const ActionPanel = ({title, message, status, id, renderIcon, actions, modal}: ActionPanelProps) => {
    const appLayout = useAppLayout();
    const clipboard = useClipboard();

    const info = appLayout.showReferenceIds && id ? (
        <Badge variant="light" onClick={() => clipboard.copy(id)}>{id}</Badge>) : null;

    return (
        <Group p={12} justify="space-between">
            <Group>
                {renderIcon(32)}
                <Stack justify="flex-start" align="flex-start" gap={0}>
                    <Group gap="sm">
                        <Text fw={500}>{title}</Text>
                        {status}
                        {info}
                    </Group>
                    <Text c="dimmed" fw={400} size="sm">{message}</Text>
                </Stack>
            </Group>
            {actions}
            {modal}
        </Group>
    )
}
