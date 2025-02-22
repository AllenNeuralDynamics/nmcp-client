import * as React from "react";
import {useEffect, useState} from "react";

import {NeuroglancerProxy} from "../../util/neuroglancer";
import {UserPreferences} from "../../util/userPreferences";

export type NeuroglancerContainerProps = {
    skeletonSegmentIds: number[];
    compartments: any[];
    elementName: string
    width: number;
    height: number;
}

export const NeuroglancerContainer = (props: NeuroglancerContainerProps) => {
    const [ngProxy, setNgProxy] = useState<NeuroglancerProxy>(null)

    useEffect(() => {
        const proxy = NeuroglancerProxy.configureSearchNeuroglancer("neuroglancer-container", UserPreferences.Instance.searchViewerState, selectNeuron);

        setNgProxy(proxy);

        return () => {
            proxy.unlinkNeuroglancerHandler();
        }
    }, []);

    useEffect(() => {
        if (ngProxy) {
            ngProxy.updateSearchReconstructions(props.skeletonSegmentIds);
        }
    }, [props.skeletonSegmentIds]);

    useEffect(() => {
        if (ngProxy) {
            const ids = props.compartments.filter(c => c.isDisplayed).map(c => c.compartment.structureId)
            ngProxy.updateSearchCompartments(ids);
        }
    }, [props.compartments]);

    const selectNeuron = (obj: any) => {
        console.log(`selected skeleton id: ${obj}`);
    }

    return <div id="neuroglancer-container" style={{minHeight: props.height, padding: "40px"}}/>
}
