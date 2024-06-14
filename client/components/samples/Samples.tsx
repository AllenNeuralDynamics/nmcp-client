import * as React from "react";
import {Divider} from "semantic-ui-react";
import {useQuery} from "@apollo/react-hooks";

import {MOUSE_STRAINS_QUERY, MouseStrainsQueryResponse} from "../../graphql/mouseStrain";
import {SAMPLES_QUERY, SamplesQueryResponse} from "../../graphql/sample";
import {Neurons} from "../neurons/Neurons";
import {SamplesTable} from "./SampleTable";

export const Samples = () => {
    const {loading, error, data} = useQuery<MouseStrainsQueryResponse>(MOUSE_STRAINS_QUERY, {pollInterval: 5000});

    const {loading: loadingSamples, error: errorSamples, data: dataSamples} = useQuery<SamplesQueryResponse>(SAMPLES_QUERY, {pollInterval: 5000});

    if (error || loading) {
        return null;
    }

    if (errorSamples || loadingSamples) {
        return null;
    }

    return (
        <div style={{margin: "16px"}}>
            <SamplesTable samples={dataSamples.samples.items} mouseStrains={data.mouseStrains || null}/>
            <p/>
            <Neurons samples={dataSamples.samples.items}/>
        </div>
    );
};
