import * as React from "react";
import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Divider, Stack, useComputedColorScheme} from "@mantine/core";

import {SpecimenSpaceViewer} from "../../viewer/specimenSpaceViewer";
import {NeuronShape, selectSomaLocation} from "../../models/neuron";
import {Reconstruction} from "../../models/reconstruction";
import {NeuroglancerControls} from "../common/NeuroglancerControls";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";

type NeuronSpecimenSpaceViewProps = {
    neuron: NeuronShape;
    reconstruction?: Reconstruction;
};

export const NeuronSpecimenSpaceView = observer(({neuron, reconstruction}: NeuronSpecimenSpaceViewProps) => {
    const scheme = useComputedColorScheme();

    const systemConfiguration = useSystemConfiguration();

    const [viewer, setViewer] = useState<SpecimenSpaceViewer>(null);

    const somaLocation = selectSomaLocation(neuron?.specimenSoma, reconstruction?.soma);

    // specimen space is voxels = microns / 10
    const somaPoint = somaLocation ? {x: somaLocation.x / 10, y: somaLocation.y / 10, z: somaLocation.z / 10} : null;

    useEffect(() => {
        const v = new SpecimenSpaceViewer("neuron-specimen-ng-container", systemConfiguration.precomputedLocation, scheme == "dark");

        v.updateState();

        if (neuron?.specimen) {
            v.setTomography(neuron.specimen.label, neuron.specimen.tomography);
        }

        const skeletonId = reconstruction?.precomputed?.skeletonId;
        v.setNeuronSkeletonId(skeletonId ? [skeletonId] : null);

        v.setSomaFocus(somaPoint);

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

            const skeletonId = reconstruction?.precomputed?.skeletonId;
            viewer.setNeuronSkeletonId(skeletonId ? [skeletonId] : null);
        }
    }, [neuron, reconstruction]);

    useEffect(() => {
        if (viewer) {
            viewer.setSomaFocus(somaPoint);
        }
    }, [somaLocation?.x, somaLocation?.y, somaLocation?.z]);

    useEffect(() => {
        if (viewer) {
            viewer.colorScheme = scheme == "dark";
        }
    }, [scheme]);

    return (
        <Stack gap={0} style={{flexGrow: 1}}>
            <NeuroglancerControls viewer={viewer} allowResetView={true}/>
            <Divider orientation="horizontal"/>
            <div id="neuron-specimen-ng-container" className="ng-default-container" style={{flexGrow: 1, minHeight: "600px"}}/>
        </Stack>
    )
});
