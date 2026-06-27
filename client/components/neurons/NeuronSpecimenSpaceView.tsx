import * as React from "react";
import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Divider, Stack, useComputedColorScheme} from "@mantine/core";

import {SpecimenSpaceViewer} from "../../viewer/specimenSpaceViewer";
import {NeuronShape, SomaLocation} from "../../models/neuron";
import {Reconstruction} from "../../models/reconstruction";
import {NeuroglancerControls} from "../common/NeuroglancerControls";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";

type NeuronSpecimenSpaceViewProps = {
    neuron: NeuronShape;
    reconstruction?: Reconstruction;
    focusSoma?: SomaLocation;
    onFocusApplied?: () => void;
};

export const NeuronSpecimenSpaceView = observer(({neuron, reconstruction, focusSoma, onFocusApplied}: NeuronSpecimenSpaceViewProps) => {
    const scheme = useComputedColorScheme();

    const systemConfiguration = useSystemConfiguration();

    const [viewer, setViewer] = useState<SpecimenSpaceViewer>(null);

    const specimenSoma = neuron?.specimenSoma;

    // specimen space is voxels = microns / 10, matching viewerPosition scaling
    const somaPoint = specimenSoma && Number.isFinite(specimenSoma.x) && Number.isFinite(specimenSoma.y) && Number.isFinite(specimenSoma.z)
        ? {x: specimenSoma.x / 10, y: specimenSoma.y / 10, z: specimenSoma.z / 10}
        : null;

    useEffect(() => {
        const v = new SpecimenSpaceViewer("neuron-specimen-ng-container", systemConfiguration.precomputedLocation, scheme == "dark");

        v.updateState();

        if (neuron?.specimen) {
            v.setTomography(neuron.specimen.label, neuron.specimen.tomography);
        }

        const skeletonId = reconstruction?.precomputed?.skeletonId;
        v.setNeuronSkeletonId(skeletonId ? [skeletonId] : null);

        v.setSomaAnnotation(somaPoint);

        if (focusSoma) {
            if (Number.isFinite(focusSoma.x) && Number.isFinite(focusSoma.y) && Number.isFinite(focusSoma.z)) {
                // viewerPosition does not scale; specimen space is voxels = microns / 10
                v.viewerPosition = {x: focusSoma.x / 10, y: focusSoma.y / 10, z: focusSoma.z / 10};
            }
            onFocusApplied?.();
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

            const skeletonId = reconstruction?.precomputed?.skeletonId;
            viewer.setNeuronSkeletonId(skeletonId ? [skeletonId] : null);

            viewer.setSomaAnnotation(somaPoint);
        }
    }, [neuron, reconstruction]);

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
