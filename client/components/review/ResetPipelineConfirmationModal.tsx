import * as React from "react";
import {Button, Group, Modal, Stack, Text} from "@mantine/core";

import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {actionColor, actionName, ReconstructionAction} from "../../models/reconstructionAction";

type ResetPipelineConfirmationModalProps = {
    show: boolean;
    sourceStatus: ReconstructionStatus;

    onClose(confirmed: boolean): void;
}

export const ResetPipelineConfirmationModal = (props: ResetPipelineConfirmationModalProps) => {
    const fromReady = props.sourceStatus == ReconstructionStatus.ReadyToPublish;

    const message = fromReady ?
        "This reconstruction completed every automated phase and is ready to publish.  Replaying the pipeline discards that run, and it cannot be recovered by any other action." :
        "The current run stopped at a failed phase.  The atlas-space pipeline will start again from its first automated phase.";

    return (
        <Modal.Root opened={props.show} onClose={() => props.onClose(false)} size="lg" centered>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>{actionName(ReconstructionAction.ResetPipeline)}</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack m={0} p={12}>
                        <Text>{message}</Text>
                        <Group justify="flex-end">
                            <Button variant="outline" onClick={() => props.onClose(false)}>Cancel</Button>
                            <Button variant="light" color={fromReady ? "red" : actionColor(ReconstructionAction.ResetPipeline)}
                                    onClick={() => props.onClose(true)}>{actionName(ReconstructionAction.ResetPipeline)}</Button>
                        </Group>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
}
