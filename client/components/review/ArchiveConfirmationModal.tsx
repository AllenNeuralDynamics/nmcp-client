import * as React from "react";
import {Button, Group, Modal, Stack, Text} from "@mantine/core";

type ArchiveConfirmationModalProps = {
    show: boolean;

    onClose(replace: boolean): void;
}

export const ArchiveConfirmationModal = (props: ArchiveConfirmationModalProps) => {
    return (
        <Modal.Root opened={props.show} onClose={() => props.onClose(false)} size="lg" centered>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>Replace Published Reconstruction</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack m={0} p={12}>
                        <Text>This neuron has an existing published neuron in the search portal.
                        </Text>
                        <Text size="sm">To publish this reconstruction, the existing reconstruction will be archived as part of the neuron version history and
                            its contents removed from the search results. Data from this reconstruction will be added to the search index to represent this
                            neuron.
                        </Text>

                        <Group justify="flex-end">
                            <Button variant="outline" onClick={() => props.onClose(false)}>Keep Existing</Button>
                            <Button variant="light" color="orange" onClick={() => props.onClose(true)}>Archive Existing and Publish</Button>
                        </Group>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
}