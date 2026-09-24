import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Divider, Group, Modal, Radio, Stack, Text} from "@mantine/core";

import {
    PUBLISH_ALL_RECONSTRUCTION_MUTATION,
    PublishAllLimit,
    PublishAllReconstructionResponse, PublishAllReconstructionVariables,
    RECONSTRUCTIONS_QUERY
} from "../../../graphql/reconstruction";
import {errorNotification, infoNotification, successNotification} from "../../common/NotificationHelper";
import {Reconstruction} from "../../../models/reconstruction";
import {PublishAllMode, publishAllOutcome} from "./publishAllOutcome";

type PublishAllModalProps = {
    open: boolean;
    reconstructions: Reconstruction[];
    totalCount: number;

    onClose(): void;
}

export const PublishAllModal = ({open, reconstructions, totalCount, onClose}: PublishAllModalProps) => {
    const [publishAll, setPublishAll] = useState<string>("shown");

    // No hook-level onCompleted: Apollo falls back to the latest render's options, which would read the radio as it is
    // when the request finishes rather than as it was sent.  onPublish passes a per-call onCompleted instead.
    const [publish, {loading}] = useMutation<PublishAllReconstructionResponse, PublishAllReconstructionVariables>(PUBLISH_ALL_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onError: (e) => {
                if (e.graphQLErrors?.[0]?.extensions?.code == 1007) {
                    errorNotification("Error Publishing Reconstructions", `At most ${PublishAllLimit} reconstructions can be published in one request.`);
                    return;
                }

                errorNotification("Error Publishing Reconstructions", e.message);
            }
        });

    const visibleCount = reconstructions.length;

    const needChoice = visibleCount !== totalCount;

    let selectOption: React.JSX.Element;

    if (needChoice) {
        const text = (
            <Group gap={4}>
                <Text size="md">Would you like to publish all shown on the current page</Text>
                <Text size="md" fw={500} fs="italic" c="dimmed">- or -</Text>
                <Text size="md">all ready to publish including not shown?</Text>
            </Group>
        )
        const description = <Text size="sm" c="dimmed">{`There are ${totalCount} reconstructions marked ready to publish.`}</Text>
        selectOption = (
            <Radio.Group value={publishAll} onChange={setPublishAll} label={text} description={description} disabled={loading}>
                <Group mt="xs">
                    <Radio value="shown" label={`Shown (${visibleCount})`}/>
                    <Radio value="all" label={`All, up to ${PublishAllLimit} per run`}/>
                </Group>
            </Radio.Group>
        );
    } else {
        selectOption = <Text size="sm">{`${visibleCount} reconstructions will be submitted for publishing.  The result reports how many were queued.`}</Text>
    }

    const report = (mode: PublishAllMode, requested: number, published: number) => {
        const outcome = publishAllOutcome(mode, requested, published);

        switch (outcome.severity) {
            case "success":
                successNotification(outcome.title, outcome.message);
                break;
            case "info":
                infoNotification(outcome.title, outcome.message);
                break;
            default:
                errorNotification(outcome.title, outcome.message);
        }

        onClose();
    }

    const onPublish = async () => {
        const mode: PublishAllMode = needChoice && publishAll == "all" ? "all" : "shown";

        const reconstructionIds = mode == "all" ? ["ALL"] : reconstructions.map(r => r.id);

        const requested = reconstructionIds.length;

        await publish({
            variables: {reconstructionIds},
            onCompleted: data => report(mode, requested, data.publishAll.length)
        });
    }

    return (
        <Modal.Root opened={open} onClose={onClose} size="auto" centered>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>Publish</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack gap={0}>
                        <Stack m={0} p={16}>
                            {selectOption}
                        </Stack>
                        <Divider orientation="horizontal"/>
                        <Group p={12} justify="flex-end">
                            <Button loading={loading} onClick={() => onPublish()}>Publish</Button>
                        </Group>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    )
}
