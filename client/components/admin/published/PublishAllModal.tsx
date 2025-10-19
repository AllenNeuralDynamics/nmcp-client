import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Divider, Group, Modal, Radio, Stack, Text} from "@mantine/core";

import {
    PUBLISH_ALL_RECONSTRUCTION_MUTATION,
    PublishAllReconstructionResponse, PublishAllReconstructionVariables,
    RECONSTRUCTIONS_QUERY
} from "../../../graphql/reconstruction";
import {errorNotification, successNotification} from "../../common/NotificationHelper";
import {Reconstruction} from "../../../models/reconstruction";

type PublishAllModalProps = {
    open: boolean;
    reconstructions: Reconstruction[];
    totalCount: number;

    onClose(): void;
}

export const PublishAllModal = ({open, reconstructions, totalCount, onClose}: PublishAllModalProps) => {
    const [publishAll, setPublishAll] = useState<string>("shown");

    const [publish, {loading}] = useMutation<PublishAllReconstructionResponse, PublishAllReconstructionVariables>(PUBLISH_ALL_RECONSTRUCTION_MUTATION,
        {
            refetchQueries: [RECONSTRUCTIONS_QUERY],
            onCompleted: (data) => onPublishCompleted(data.publishAll),
            onError: (e) => errorNotification("Error Publishing Reconstructions", e.message)
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
            <Radio.Group value={publishAll} onChange={setPublishAll} label={text} description={description}>
                <Group mt="xs">
                    <Radio value="shown" label={`Shown (${visibleCount})`}/>
                    <Radio value="all" label={`All (${totalCount})`}/>
                </Group>
            </Radio.Group>
        );
    } else {
        selectOption = <Text size="sm">{`${visibleCount} reconstructions will begin search indexing and be published`}</Text>
    }

    const onPublishCompleted = (updated: Reconstruction[]) => {
        if (updated.length > 0) {
            successNotification("Publish Submitted", `${updated.length} reconstructions queued for search indexing.`);
        }

        onClose();
    }

    const onPublish = async () => {
        let reconstructionIds = reconstructions.map(r => r.id);

        if (publishAll == "all") {
            reconstructionIds = ["ALL"];
        }
        await publish({variables: {reconstructionIds: reconstructionIds}});
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
