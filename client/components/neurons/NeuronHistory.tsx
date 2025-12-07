import React from "react";
import {Stack, Stepper} from "@mantine/core";
import dayjs from "dayjs";

import {NeuronShape} from "../../models/neuron";

export const NeuronHistory = ({neuron}: { neuron: NeuronShape }) => {
    const reconstruction = neuron.reconstructions?.length > 0 ? neuron.reconstructions[0] : null;

    return <>
        <Stack m={16}>
            <Stepper active={10} allowNextStepsSelect={false}>
                <Stepper.Step label="Specimen Created" description={neuron.specimen.createdAt ? dayjs(neuron.specimen.createdAt).format("YYYY-MM-DD") : "Unknown"}>
                </Stepper.Step>
                <Stepper.Step label="Neuron Created" description={dayjs(neuron.createdAt).format("YYYY-MM-DD")}>
                </Stepper.Step>
                {reconstruction ?
                    <Stepper.Step label="Reconstruction Created" description={dayjs(reconstruction.createdAt).format("YYYY-MM-DD")}>
                    </Stepper.Step>
                : null}
                {neuron.published ?
                    <Stepper.Step label="Published" description={dayjs(neuron.published.updatedAt).format("YYYY-MM-DD")}>
                    </Stepper.Step>
                    : null}
            </Stepper>
        </Stack>
    </>
}
