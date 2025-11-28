import React from "react";
import {Button, Group, Modal, Stack, Text} from "@mantine/core";

type MessageBoxProps = {
    opened: boolean;
    centered?: boolean;
    title: string;
    message: string;
    cancellable?: boolean;
    cancelText?: string;
    confirmText?: string;

    onCancel?(): void;
    onConfirm(): void;
}

export const MessageBox = ({opened, centered, title, message, cancellable, cancelText, confirmText, onCancel, onConfirm}: MessageBoxProps) => {
    const isCancellable = (cancellable === undefined || cancellable !== false);

    return (<Modal opened={opened} onClose={onCancel} title={title} centered={centered}>
        <Stack>
            <Text size="sm">{message}</Text>
            <Group justify="flex-end">
                {isCancellable ? <Button variant="outline" onClick={onCancel}>{cancelText ?? "Cancel"}</Button> : null}
                <Button onClick={onConfirm}>{confirmText ?? "Ok"}</Button>
            </Group>
        </Stack>
    </Modal>);
}
