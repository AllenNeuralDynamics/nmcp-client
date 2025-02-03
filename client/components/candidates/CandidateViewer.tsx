import * as React from "react";
import {useEffect, useState} from "react";

import {createNeuroglancerAnnotationLayer, INeuron} from "../../models/neuron";
import {NeuroglancerProxy} from "../../util/neuroglancer";
import {Button} from "semantic-ui-react";
import {UserPreferences} from "../../util/userPreferences";

export interface ITracingsTableProps {
    neurons: INeuron[];
    selectedId: string;

    onViewerSelected(id: string): void;
}

export const CandidatesViewer = (props: ITracingsTableProps) => {
    const [ngProxy, setNgProxy] = useState<NeuroglancerProxy>(null)

    useEffect(() => {
        console.log("use effect");

        const annotations = createNeuroglancerAnnotationLayer(props.neurons, props.selectedId);

        const proxy = NeuroglancerProxy.configureCandidateNeuroglancer("neuroglancer-container", UserPreferences.Instance.candidateViewerState, annotations, selectNeuron);

        setNgProxy(proxy);

        return () => {
            console.log("unlink")
            proxy.unlinkNeuroglancerHandler();
        }
    }, []);

    useEffect(() => {
        if (ngProxy) {
            const annotations = createNeuroglancerAnnotationLayer(props.neurons, props.selectedId);

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

    const selectNeuron = (obj: any) => {
        if (obj != props.selectedId) {
            props.onViewerSelected(obj);
        }
    }

    const resetView = () => {
        ngProxy.resetNeuroglancerState();

        const annotations = createNeuroglancerAnnotationLayer(props.neurons, props.selectedId);

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
