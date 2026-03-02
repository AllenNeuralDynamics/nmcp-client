import React, {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Divider, Group, Modal, Radio, Stack, Text, TextInput} from "@mantine/core";

import {
    NEURONS_QUERY,
    NeuronsQueryVariables,
    UPDATE_NEURONS_BY_QUERY_MUTATION,
    UPDATE_NEURONS_MUTATION,
    UpdateNeuronsByQueryResponse,
    UpdateNeuronsByQueryVariables,
    UpdateNeuronsResponse,
    UpdateNeuronsVariables,
} from "../../graphql/neuron";
import {parseKeywords} from "../../models/neuron";
import {errorNotification, successNotification} from "../common/NotificationHelper";

type BulkUpdateModalProps = {
    open: boolean;
    neuronIds: string[];
    totalCount: number;
    queryInput: NeuronsQueryVariables["input"];
    onClose(): void;
}

export const BulkUpdateModal = ({open, neuronIds, totalCount, queryInput, onClose}: BulkUpdateModalProps) => {
    const [scope, setScope] = useState<string>("shown");
    const [keywords, setKeywords] = useState<string>("");

    const needChoice = neuronIds.length !== totalCount;

    const [updateNeurons, {loading: updatingById}] = useMutation<UpdateNeuronsResponse, UpdateNeuronsVariables>(UPDATE_NEURONS_MUTATION, {
        refetchQueries: [NEURONS_QUERY],
        onCompleted: (data) => successNotification("Update Neurons", `${data.updateNeurons.length} neurons updated`),
        onError: (e) => errorNotification("Bulk Update", e.message)
    });

    const [updateNeuronsByQuery, {loading: updatingByQuery}] = useMutation<UpdateNeuronsByQueryResponse, UpdateNeuronsByQueryVariables>(UPDATE_NEURONS_BY_QUERY_MUTATION, {
        refetchQueries: [NEURONS_QUERY],
        onCompleted: (data) => successNotification("Update Neurons", `${data.updateNeuronsByQuery.length} neurons updated`),
        onError: (e) => errorNotification("Update Neurons", e.message)
    });

    const loading = updatingById || updatingByQuery;
    const shownCount = neuronIds.length;

    let selectOption: React.JSX.Element;

    if (needChoice) {
        const text = (
            <Group gap={4}>
                <Text size="md">Would you like to update all shown on the current page</Text>
                <Text size="md" fw={500} fs="italic" c="dimmed">- or -</Text>
                <Text size="md">all neurons matching the current filters?</Text>
            </Group>
        );
        const description = <Text size="sm" c="dimmed">{`There are ${totalCount} neurons matching the current filters.`}</Text>;
        selectOption = (
            <Radio.Group value={scope} onChange={setScope} label={text} description={description}>
                <Group mt="xs">
                    <Radio value="shown" label={`Shown (${shownCount})`}/>
                    <Radio value="all" label={`All (${totalCount})`}/>
                </Group>
            </Radio.Group>
        );
    } else {
        selectOption = <Text size="sm">{shownCount === 1 ? "1 neuron will be updated." : `${shownCount} neurons will be updated.`}</Text>;
    }

    const handleClose = () => {
        setKeywords("");
        setScope("shown");
        onClose();
    };

    const onUpdate = async () => {
        const parsed = parseKeywords(keywords);

        if (scope === "all") {
            await updateNeuronsByQuery({variables: {input: {query: queryInput, keywords: parsed}}});
        } else {
            await updateNeurons({variables: {input: {ids: neuronIds, keywords: parsed}}});
        }

        handleClose();
    };

    return (
        <Modal.Root opened={open} onClose={handleClose} size="lg" centered>
            <Modal.Overlay/>
            <Modal.Content>
                <Modal.Header bg="segment">
                    <Modal.Title>Update Neurons</Modal.Title>
                    <Modal.CloseButton/>
                </Modal.Header>
                <Modal.Body p={0}>
                    <Stack gap={0}>
                        <Stack m={0} p={16}>
                            <TextInput label="Keywords" description="If left empty all keywords will be removed" value={keywords}
                                       onChange={(e) => setKeywords(e.currentTarget.value)}/>
                            {selectOption}
                        </Stack>
                        <Divider orientation="horizontal"/>
                        <Group p={12} justify="flex-end">
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button loading={loading} onClick={onUpdate}>Update</Button>
                        </Group>
                    </Stack>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
