import * as React from "react";
import {useContext, useEffect, useState} from "react";

import {createCandidateAnnotationLayer, INeuron} from "../../models/neuron";
import {NeuroglancerProxy} from "../../viewer/neuroglancer";
import {Button} from "semantic-ui-react";
import {UserPreferences} from "../../util/userPreferences";
import {ConstantsContext} from "../app/AppConstants";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";

export interface ITracingsTableProps {
    neurons: INeuron[];
    selectedId: string;

    onViewerSelected(id: string): void;
}

export const CandidatesViewer = (props: ITracingsTableProps) => {
    const [ngProxy, setNgProxy] = useState<NeuroglancerProxy>(null);

    const constants = useContext(ConstantsContext);
    const systemConfiguration = useSystemConfiguration();

    useEffect(() => {
        const annotations = createCandidateAnnotationLayer(props.neurons, props.selectedId);

        const proxy = NeuroglancerProxy.configureCandidateNeuroglancer("neuroglancer-container", UserPreferences.Instance.candidateViewerState, annotations, selectNeuron, systemConfiguration.precomputedLocation, constants.BrainStructureColorMap);

        setNgProxy(proxy);

        return () => {
            proxy.unlinkNeuroglancerHandler();
        }
    }, []);

    useEffect(() => {
        if (ngProxy) {
            const annotations = createCandidateAnnotationLayer(props.neurons, props.selectedId);

            let selectedSkeletonSegmentId = null;

            if (props.selectedId) {
                const selected = props.neurons.find(n => n.id == props.selectedId);

                if (selected?.reconstructions?.length > 0) {
                    selectedSkeletonSegmentId = selected.reconstructions[0]?.precomputed?.skeletonSegmentId;
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
        <div>
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px"}}>
                <div/>
                <Button negative icon="repeat" size="small" content="Reset View" onClick={() => resetView()}/>
            </div>
            <div id="neuroglancer-container" style={{minHeight: "400px", padding: "40px"}}/>
        </div>
    );
}
