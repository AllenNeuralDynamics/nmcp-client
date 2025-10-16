import {useQuery} from "@apollo/client";

import {SAMPLES_QUERY, SamplesQueryResponse} from "../../graphql/sample";

export const PolledData = () => {
    useQuery<SamplesQueryResponse>(SAMPLES_QUERY, {pollInterval: 30000, fetchPolicy: "cache-and-network"});
    return null;
}
