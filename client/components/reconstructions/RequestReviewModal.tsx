import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Badge, Button, Group, Modal, NumberInput, Select, Stack, Textarea} from "@mantine/core";

import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {ReconstructionMetadata} from "../../viewmodel/reconstructionMetadata";
import {REQUEST_REVIEW_MUTATION, RequestReviewArgs, RequestReviewResponse} from "../../graphql/reconstruction";

export type CompleteReconstructionDialogProps = {
    id: string;
    show: boolean;
    requestedStatus: ReconstructionStatus;
    onClose(): void;
}

export const RequestReviewModal = observer((props: CompleteReconstructionDialogProps) => {
    const [metadata] = useState(new ReconstructionMetadata());

    const [requestReview] = useMutation<RequestReviewResponse, RequestReviewArgs>(REQUEST_REVIEW_MUTATION,
        {
            refetchQueries: ["ReconstructionsQuery", "ReviewableReconstructions"],
            onError: (e) => console.log(e)
        });

    const onRequestReview = async () => {
        const variables: RequestReviewArgs = {
            reconstructionId: props.id,
            targetStatus: props.requestedStatus,
            duration: metadata.duration,
            notes: metadata.notes
        };

        await requestReview({variables: variables});

        props.onClose();
    }

    const review = props.requestedStatus == ReconstructionStatus.PeerReview ? "Peer Review" : "Publish Review";

    return (
        <Modal.Root centered size="lg"  opened={props.show} onClose={props.onClose}>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>{`Request ${review}`}</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack m={0} p={12}>
                        <NumberInput label="Duration" rightSection={<Badge variant={"light"} radius="sm" size="sm">hr</Badge>} rightSectionWidth={50}
                                     value={metadata.duration || ""} onChange={(v) => metadata.setDuration(v)}/>
                        <Textarea label="Notes" value={metadata.notes} onChange={t => metadata.notes = t.currentTarget.value}/>
                        <Group justify="flex-end">
                            <Button onClick={onRequestReview}>{`Request ${review}`}</Button>
                        </Group>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    )
});
