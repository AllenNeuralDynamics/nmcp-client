import * as React from "react";
import {useQuery} from "@apollo/client";

import {SAMPLES_QUERY, SamplesQueryResponse} from "../../graphql/sample";
import {Neurons} from "../neurons/Neurons";
import {SamplesTable} from "./SampleTable";

export const Samples = () => {
    const {loading: loading, error: error, data: data} = useQuery<SamplesQueryResponse>(SAMPLES_QUERY, {pollInterval: 5000});

    if (error || loading) {
        return null;
    }

    return (
        <div style={{margin: "16px"}}>
            <SamplesTable samples={data.samples.items} collections={data.collections} mouseStrains={data.mouseStrains || null}/>
            <p/>
            <Neurons samples={data.samples.items}/>
        </div>
    );
};
