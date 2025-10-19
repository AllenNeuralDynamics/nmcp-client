import React from "react";
import {Button, Group, Modal, Stack, Text} from "@mantine/core";

type MessageBoxProps = {
    opened: boolean;
    centered?: boolean;
    title: string;
    message: string;
    cancelText?: string;
    confirmText?: string;

    onCancel?(): void;
    onConfirm(): void;
}

export const MessageBox = ({opened, centered, title, message, cancelText, confirmText, onCancel, onConfirm}: MessageBoxProps) => {
    return (<Modal opened={opened} onClose={onCancel} title={title} centered={centered}>
        <Stack>
            <Text size="sm">{message}</Text>
            <Group justify="flex-end">
                <Button variant="outline" onClick={onCancel}>{cancelText ?? "Cancel"}</Button>
                <Button onClick={onConfirm}>{confirmText ?? "Ok"}</Button>
            </Group>
        </Stack>
    </Modal>);
}
