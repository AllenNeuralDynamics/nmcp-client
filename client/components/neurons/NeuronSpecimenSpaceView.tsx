import * as React from "react";
import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Divider, Stack, useComputedColorScheme} from "@mantine/core";

import {SpecimenSpaceViewer} from "../../viewer/specimenSpaceViewer";
import {NeuronShape} from "../../models/neuron";
import {NeuroglancerControls} from "../common/NeuroglancerControls";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";

export const NeuronSpecimenSpaceView = observer(({neuron}: { neuron: NeuronShape }) => {
    const scheme = useComputedColorScheme();

    const systemConfiguration = useSystemConfiguration();

    const [viewer, setViewer] = useState<SpecimenSpaceViewer>(null);

    useEffect(() => {
        const v = new SpecimenSpaceViewer("neuron-specimen-ng-container", systemConfiguration.precomputedLocation, scheme == "dark");

        v.updateState();

        if (neuron?.specimen) {
            v.setTomography(neuron.specimen.label, neuron.specimen.tomography);
        }

        if (neuron?.reconstructions) {
            const skeletonIds = neuron.reconstructions.map(r => r.precomputed?.skeletonId).filter(s => s);

            v.setNeuronSkeletonId(skeletonIds);
        } else {
            v.setNeuronSkeletonId(null);
        }

        setViewer(v);

        return () => {
            v.unlink();
        }
    }, []);

    useEffect(() => {
        if (viewer) {
            if (neuron?.specimen) {
                viewer.setTomography(neuron.specimen.label, neuron.specimen.tomography);
            }

            if (neuron?.reconstructions) {
                const skeletonIds = neuron.reconstructions.map(r => r.precomputed?.skeletonId).filter(s => s);

                viewer.setNeuronSkeletonId(skeletonIds);
            } else {
                viewer.setNeuronSkeletonId(null);
            }
        }
    }, [neuron]);

    useEffect(() => {
        if (viewer) {
            viewer.colorScheme = scheme == "dark";
        }
    }, [scheme]);

    return (
        <Stack gap={0} style={{flexGrow: 1}}>
            <NeuroglancerControls viewer={viewer} allowResetView={false}/>
            <Divider orientation="horizontal"/>
            <div id="neuron-specimen-ng-container" className="ng-default-container" style={{flexGrow: 1, minHeight: "600px"}}/>
        </Stack>
    )
});
