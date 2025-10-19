import * as React from "react";
import {useParams} from "react-router-dom";
import {useQuery} from "@apollo/client";

import {NEURON_VERSIONS_QUERY, NeuronVersionsQueryResponse, NeuronVersionsQueryVariables} from "../../../graphql/neuron";
import {Center, Stack} from "@mantine/core";
import {Overview} from "./Overview";
import {useIsAuthenticated} from "@azure/msal-react";
import {GraphQLErrorAlert} from "../../common/GraphQLErrorAlert";

export const NeuronVersions = () => {
    let {neuronId, versionId} = useParams();

    const isAuthenticated = useIsAuthenticated();

    if (!versionId) {
        versionId = "latest";
    }

    const {error, data} = useQuery<NeuronVersionsQueryResponse, NeuronVersionsQueryVariables>(NEURON_VERSIONS_QUERY,
        {
            pollInterval: 10000,
            variables: {id: neuronId}
        });

    if (error) {
        return <GraphQLErrorAlert title="Neuron Data Could not be Loaded" error={error}/>;
    }

    return (
        <Stack p={20} align="stretch">
            <Center>
                <Overview neuron={data?.neuron}/>
            </Center>
        </Stack>
    );
}
