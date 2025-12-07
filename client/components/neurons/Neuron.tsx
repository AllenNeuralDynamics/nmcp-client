import * as React from "react";
import {useParams} from "react-router-dom";
import {useQuery} from "@apollo/client";
import {useIsAuthenticated} from "@azure/msal-react";
import {Badge, Card, Center, Divider, Group, Stack, Tabs, Text} from "@mantine/core";
import dayjs from "dayjs";

import {NEURON_VERSIONS_QUERY, NeuronVersionsQueryResponse, NeuronVersionsQueryVariables} from "../../graphql/neuron";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";
import {AppLoading} from "../app/AppLoading";
import {useClipboard} from "@mantine/hooks";
import {useAppLayout} from "../../hooks/useAppLayout";
import {NeuronSpecimenSpaceView} from "./NeuronSpecimenSpaceView";
import {NeuronAtlasSpaceView} from "./NeuronAtlasSpaceView";
import {useState} from "react";
import {IconBinaryTree, IconBinaryTreeFilled, IconVersions} from "@tabler/icons-react";
import {SpecimenSpace} from "../review/reconstruction/SpecimenSpace";
import {AtlasSpace} from "../review/reconstruction/AtlasSpace";
import {NeuronHistory} from "./NeuronHistory";

export const Neuron = () => {
    let {neuronId, versionId} = useParams();

    const clipboard = useClipboard();

    const appLayout = useAppLayout();

    const [activeTab, setActiveTab] = useState<string | null>("atlas");

    const isAuthenticated = useIsAuthenticated();

    if (!versionId) {
        versionId = "latest";
    }

    const {error, data} = useQuery<NeuronVersionsQueryResponse, NeuronVersionsQueryVariables>(NEURON_VERSIONS_QUERY,
        {
            pollInterval: 10000,
            variables: {id: neuronId}
        });

    const onChangeTab = (tab: string) => {
        setActiveTab(tab);
    }

    if (error) {
        return <GraphQLErrorAlert title="Neuron Data Could not be Loaded" error={error}/>;
    }

    if (!data?.neuron) {
        return <AppLoading message="Loading Neuron..."/>;
    }

    const info = appLayout.showReferenceIds ? (
        <Badge variant="light" onClick={() => clipboard.copy(data.neuron.id)}>{data.neuron.id}</Badge>) : null;

    const isPublished = data.neuron.published != null;

    const published = isPublished ? `Published ${dayjs(data.neuron.published.searchIndexedAt).format("YYYY-MM-DD")}` : "Unpublished";

    return (
        <Stack p={20} align="stretch">
            <Card withBorder>
                <Card.Section bg="segment">
                    <Group p={12} justify="space-between">
                        <Stack gap={0}>
                            <Group align="center">
                                <Text size="lg" fw={500}>Neuron {data.neuron.label}</Text>
                                {info}
                            </Group>
                            <Text size="sm" c="dimmed">Specimen {data.neuron.specimen.label}</Text>
                        </Stack>
                        <Badge bg={isPublished ? "green" : "orange"}>{published}</Badge>
                    </Group>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section bg="segment">
                    <Tabs orientation="horizontal" value={activeTab} onChange={onChangeTab}>
                        <Tabs.List>
                            <Tabs.Tab value="atlas" leftSection={<IconBinaryTreeFilled size={18} style={{transform: "rotate(-90deg)"}}/>}>
                                Atlas-Space Reconstruction
                            </Tabs.Tab>
                            <Tabs.Tab value="specimen" leftSection={<IconBinaryTree size={18} style={{transform: "rotate(-90deg)"}}/>}>
                                Specimen-Space Reconstruction
                            </Tabs.Tab>
                            <Tabs.Tab value="history" leftSection={<IconVersions size={18}/>}>
                                History
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="atlas" key={`atlas_${data.neuron.id}`}>
                            <NeuronAtlasSpaceView neuron={data.neuron}/>
                        </Tabs.Panel>
                        <Tabs.Panel value="specimen" key={`specimen_${data.neuron.id}`}>
                            <NeuronSpecimenSpaceView neuron={data.neuron}/>
                        </Tabs.Panel>
                        <Tabs.Panel value="history" key={`history_${data.neuron.id}`}>
                            <NeuronHistory neuron={data.neuron}/>
                        </Tabs.Panel>
                    </Tabs>
                </Card.Section>
            </Card>
        </Stack>
    );
}
