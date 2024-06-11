import * as React from "react";
import {useEffect, useState} from "react";

import {createNeuroglancerAnnotationLayer, INeuron} from "../../models/neuron";
import {NeuroglancerProxy} from "../../util/neuroglancer";
import {Button} from "semantic-ui-react";

export interface ITracingsTableProps {
    neurons: INeuron[];
}

export const CandidatesViewer = (props: ITracingsTableProps) => {
    const [ngProxy, setNgProxy] = useState<NeuroglancerProxy>(null)

    useEffect(() => {
        const annotations = createNeuroglancerAnnotationLayer(props.neurons);

        // TODO use saved state
        const proxy = NeuroglancerProxy.configureNeuroglancer(/*UserPreferences.Instance.candidateViewerState*/null, annotations);

        setNgProxy(proxy);

        return () => {
            proxy.unlinkNeuroglancerHandler();
        }
    }, []);

    useEffect(() => {
        if (ngProxy) {
            const annotations = createNeuroglancerAnnotationLayer(props.neurons);

            ngProxy.updateAnnotations(annotations);
        }
    }, [props.neurons]);

    const resetView = () => {
        ngProxy.resetNeuroglancerState();
        
        const annotations = createNeuroglancerAnnotationLayer(props.neurons);

        ngProxy.updateAnnotations(annotations);
    };

    return (
        <div>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px"
            }}>
                <div/>
                <Button negative icon="repeat" size="small" content="Reset View" onClick={() => resetView()}/>
            </div>
            <div id="neuroglancer-container" style={{height: "800px", backgroundColor: "#aaaaaa"}}/>
        </div>
    );
}
