import * as React from "react";
import {useEffect, useState} from "react";
import {Divider, Stack, useComputedColorScheme} from "@mantine/core";

import {usePreferences} from "../../hooks/usePreferences";
import {NeuronShape} from "../../models/neuron";
import {CandidateViewer} from "../../viewer/candidateViewer";
import {NeuroglancerControls} from "../common/NeuroglancerControls";
import {AtlasViewModel} from "../../viewmodel/atlasViewModel";

export interface CandidatesViewProps {
    atlasViewModel: AtlasViewModel;
    neurons: NeuronShape[];
    selected: NeuronShape;

    onViewerSelected(id: string): void;
}

export const CandidatesView = (props: CandidatesViewProps) => {
    const [viewer, setViewer] = useState<CandidateViewer>(null);

    const preferences = usePreferences();

    const scheme = useComputedColorScheme();

    useEffect(() => {
        const v = new CandidateViewer("candidate-ng-container", props.atlasViewModel, scheme == "dark");

        v.selectionListener = selectNeuron;

        v.updateState(preferences.candidateViewerState);

        v.updateNeurons(props.neurons, props.selected);

        setViewer(v);

        return () => {
            v.unlink();
        }
    }, []);

    useEffect(() => {
        if (viewer) {
            viewer.colorScheme = scheme == "dark";
        }
    }, [scheme]);

    useEffect(() => {
        if (viewer) {
            viewer.updateNeurons(props.neurons, props.selected);
        }
    }, [props.neurons, props.selected]);

    const selectNeuron = (id: string) => {
        if (id != props.selected?.id) {
            props.onViewerSelected(id);
        }
    }

    return (
        <Stack gap={0}>
            <NeuroglancerControls viewer={viewer} allowResetView={true}/>
            <Divider orientation="horizontal"/>
            <div id="candidate-ng-container" className="ng-default-container" style={{minHeight: "400px"}}/>
        </Stack>
    );
}
