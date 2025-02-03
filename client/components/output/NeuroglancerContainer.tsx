import * as React from "react";
import {useEffect, useState} from "react";

import {NeuroglancerProxy} from "../../util/neuroglancer";
import {UserPreferences} from "../../util/userPreferences";
import {createNeuroglancerAnnotationLayer} from "../../models/neuron";

export type NeuroglancerContainerProps = {
    skeletonSegmentIds: number[];
    elementName: string
    width: number;
    height: number;
}

export const NeuroglancerContainer = (props: NeuroglancerContainerProps) => {
    const [ngProxy, setNgProxy] = useState<NeuroglancerProxy>(null)

    useEffect(() => {
        console.log("use effect");

        const proxy = NeuroglancerProxy.configureSearchNeuroglancer("neuroglancer-container", UserPreferences.Instance.searchViewerState);

        setNgProxy(proxy);

        return () => {
            console.log("unlink")
            proxy.unlinkNeuroglancerHandler();
        }
    }, []);

    useEffect(() => {
        if (ngProxy) {

            ngProxy.updateSearchReconstructions(props.skeletonSegmentIds);
        }
    }, [props.skeletonSegmentIds]);

    const selectNeuron = (obj: any) => {
        console.log(obj);
    }

    return <div id="neuroglancer-container" style={{minHeight: props.height, padding: "40px"}}/>
}
