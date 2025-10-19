import * as React from "react";
import {useEffect, useState} from "react";
import {Box, Button, Group, Stack, useComputedColorScheme} from "@mantine/core";
import {IconRestore} from "@tabler/icons-react";

import {useConstants} from "../../hooks/useConstants";
import {usePreferences} from "../../hooks/usePreferences";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";
import {createCandidateAnnotationLayer, NeuronShape} from "../../models/neuron";
import {NeuroglancerProxy} from "../../viewer/neuroglancerProxy"

export interface ITracingsTableProps {
    neurons: NeuronShape[];
    selectedId: string;

    onViewerSelected(id: string): void;
}

export const CandidatesViewer = (props: ITracingsTableProps) => {
    const [ngProxy, setNgProxy] = useState<NeuroglancerProxy>(null);

    const constants = useConstants().AtlasConstants;
    const preferences = usePreferences();
    const systemConfiguration = useSystemConfiguration()

    const scheme = useComputedColorScheme();

    useEffect(() => {
        const annotations = createCandidateAnnotationLayer(props.neurons, props.selectedId);

        const proxy = NeuroglancerProxy.configureCandidateNeuroglancer("candidate-ng-container", preferences.candidateViewerState, annotations, selectNeuron, systemConfiguration.precomputedLocation, constants.StructureColors, scheme);

        setNgProxy(proxy);

        return () => {
            proxy.unlinkNeuroglancerHandler();
        }
    }, []);

    useEffect(() => {
        ngProxy?.updateColorScheme(scheme);
    }, [scheme]);


    useEffect(() => {
        if (ngProxy) {
            const annotations = createCandidateAnnotationLayer(props.neurons, props.selectedId);

            let selectedSkeletonSegmentId = null;

            if (props.selectedId) {
                const selected = props.neurons.find(n => n.id == props.selectedId);

                if (selected?.atlasSoma) {
                    if (selected.atlasSoma.x && selected.atlasSoma.y && selected.atlasSoma.z) {
                        ngProxy.setPosition(selected.atlasSoma.x / 10, selected.atlasSoma.y / 10, selected.atlasSoma.z / 10);
                    }
                    if (selected.atlasStructure?.structureId) {
                        ngProxy.setCandidateAtlasStructures([selected.atlasStructure.structureId]);
                    }
                    if (selected?.reconstructions?.length > 0) {
                        selectedSkeletonSegmentId = selected.reconstructions[0]?.atlasReconstruction?.precomputed?.skeletonId;
                    }
                } else {
                    ngProxy.setCandidateAtlasStructures([]);
                }
            }

            ngProxy.updateCandidateAnnotations(annotations, selectedSkeletonSegmentId);
        }
    }, [props.neurons, props.selectedId]);

    const selectNeuron = (id: string) => {
        if (id != props.selectedId) {
            props.onViewerSelected(id);
        }
    }

    const resetView = () => {
        ngProxy.resetNeuroglancerState();

        const annotations = createCandidateAnnotationLayer(props.neurons, props.selectedId);

        ngProxy.updateCandidateAnnotations(annotations);
    };

    return (
        <Stack>
            <Group justify="end">
                <Button variant="light" leftSection={<IconRestore size={14}/>} size="sm" onClick={() => resetView()}>Reset View</Button>
            </Group>
            <Box bd="1px solid var(--mantine-color-segment-6)" bdrs={0}>
                <div id="candidate-ng-container" style={{minHeight: "400px"}}/>
            </Box>
        </Stack>
    );
}
