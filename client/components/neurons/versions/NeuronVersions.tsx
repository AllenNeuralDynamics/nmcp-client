import * as React from "react";
import {useParams} from "react-router-dom";

export const NeuronVersions = () => {
    let {neuronId, versionId} = useParams();

    if (!versionId) {
        versionId = "latest";
    }

    return <div>
        Neuron Version History<br/>
        Id: {neuronId}<br/>
        Version: {versionId}
    </div>
}
