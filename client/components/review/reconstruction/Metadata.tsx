import React, {useState} from "react";
import {observer} from "mobx-react-lite";
import {useMutation} from "@apollo/client";
import {Badge, NumberInput, Grid, Textarea, Group, Button, Center} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import {IconCalendar} from "@tabler/icons-react";
import dayjs from "dayjs";

import {ReconstructionMetadata} from "../../../viewmodel/reconstructionMetadata";
import {Reconstruction} from "../../../models/reconstruction";
import {UPDATE_RECONSTRUCTION_MUTATION, UpdateReconstructionResponse, UpdateReconstructionVariables} from "../../../graphql/reconstruction";
import {errorNotification} from "../../common/NotificationHelper";

export const Metadata = observer(({reconstruction}: { reconstruction: Reconstruction }) => {
    const [metadata, setMetadata] = useState(new ReconstructionMetadata(reconstruction));

    const [updateReconstruction] = useMutation<UpdateReconstructionResponse, UpdateReconstructionVariables>(UPDATE_RECONSTRUCTION_MUTATION,
        {
            variables: {reconstructionId: reconstruction.id, ...metadata.modifiedJSON()},
            onError: (e) => errorNotification("Failed to Update Reconstruction", e.message),
            onCompleted: (data) => {setMetadata(new ReconstructionMetadata(reconstruction))}
        });

    return (
            <Grid p={12} maw={400}>
                <Grid.Col span={12}>
                    <NumberInput label="Duration" rightSection={<Badge variant={"light"} radius="sm" size="sm">hr</Badge>} rightSectionWidth={50}
                                 value={metadata.duration || ""} onChange={(v) => metadata.setDuration(v)}/>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Textarea label="Notes" value={metadata.notes} onChange={t => metadata.notes = t.currentTarget.value}/>
                </Grid.Col>
                <Grid.Col span={6}>
                    <DatePickerInput label="Started At" leftSection={<IconCalendar size={18} stroke={1.5}/>} clearable valueFormat="YYYY-MM-DD"
                                     value={metadata.startedAt} onChange={(d) => metadata.startedAt = d ? dayjs(d).toDate() : null}/>
                </Grid.Col>
                <Grid.Col span={6}>
                    <DatePickerInput label="Completed At" leftSection={<IconCalendar size={18} stroke={1.5}/>} clearable valueFormat="YYYY-MM-DD"
                                     value={metadata.completedAt} onChange={(d) => metadata.completedAt = d ? dayjs(d).toDate() : null}/>
                </Grid.Col>
                <Grid.Col span={12}>
                    <Group justify="end">
                        <Button disabled={!metadata.isModified()} onClick={() => updateReconstruction()}>
                            Update
                        </Button>
                    </Group>
                </Grid.Col>
            </Grid>
    );
});
