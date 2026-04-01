import * as React from "react";
import {useParams} from "react-router-dom";
import {useQuery} from "@apollo/client";
import {Anchor, Badge, Card, Divider, Group, Space, Stack, Table, Tabs, Text} from "@mantine/core";
import {useClipboard, useLocalStorage} from "@mantine/hooks";
import {useIsAuthenticated} from "@azure/msal-react";
import {IconBinaryTree, IconBinaryTreeFilled, IconVersions} from "@tabler/icons-react";
import dayjs from "dayjs";

import {NEURON_VERSIONS_QUERY, NeuronVersionsQueryResponse, NeuronVersionsQueryVariables} from "../../graphql/neuron";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";
import {AppLoading} from "../app/AppLoading";
import {useAppLayout} from "../../hooks/useAppLayout";
import {NeuronSpecimenSpaceView} from "./NeuronSpecimenSpaceView";
import {NeuronAtlasSpaceView} from "./NeuronAtlasSpaceView";
import {NeuronHistory} from "./NeuronHistory";
import {QualityMetrics} from "./QualityMetrics";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";
import {successNotification} from "../common/NotificationHelper";

export const Neuron = () => {
    let {neuronId, versionId} = useParams();

    const clipboard = useClipboard();

    const appLayout = useAppLayout();

    const [activeTab, setActiveTab] = useLocalStorage<string>({
        key: "nmcp-neuron-active-tab",
        defaultValue: "atlas"
    });

    const isAuthenticated = useIsAuthenticated();

    const systemConfiguration = useSystemConfiguration();

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
                        <Stack gap={2} align="flex-end">
                            <Badge bg={isPublished ? "green" : "orange"}>{published}</Badge>
                            {isPublished && data.neuron.published.doi &&
                                <Group gap={2}>
                                    <Text size="sm">DOI:</Text>
                                    <Text size="sm" c="dimmed" td="underline" style={{cursor: "pointer"}}
                                          onClick={() => {
                                              clipboard.copy(`${systemConfiguration.doiHandler}/${data.neuron.published.doi}`);
                                              successNotification("DOI", "DOI copied to clipboard");
                                          }}>{`${systemConfiguration.doiHandler}/${data.neuron.published.doi}`}</Text>
                                </Group>}
                        </Stack>
                    </Group>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section p={0}  bg="segment">
                    <Group p={12} gap={8} align="baseline">
                        <Text fw={500}>Open Dataset</Text>
                        {!(isPublished && data.neuron.specimen.referenceDataset?.url) && <Text c="dimmed" size="sm">Not available.</Text>}
                    </Group>
                    {isPublished && data.neuron.specimen.referenceDataset?.url && (
                        <Table variant="vertical" withColumnBorders>
                            <Table.Tr>
                                <Table.Th colSpan={2} ta="left">Atlas Space</Table.Th>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">SWC</Table.Th>
                                <Table.Td><Anchor size="sm" href={`${data.neuron.specimen.referenceDataset.url}/ccf_space_reconstructions/swc/${data.neuron.label}-${data.neuron.specimen.label}.swc`} target="_blank">{`${data.neuron.label}-${data.neuron.specimen.label}.swc`}</Anchor></Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">JSON</Table.Th>
                                <Table.Td><Anchor size="sm" href={`${data.neuron.specimen.referenceDataset.url}/ccf_space_reconstructions/json/${data.neuron.label}-${data.neuron.specimen.label}.json`} target="_blank">{`${data.neuron.label}-${data.neuron.specimen.label}.json`}</Anchor></Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th colSpan={2} ta="left">Specimen Space</Table.Th>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">SWC</Table.Th>
                                <Table.Td><Anchor size="sm" href={`${data.neuron.specimen.referenceDataset.url}/specimen_space_reconstructions/swc/${data.neuron.label}-${data.neuron.specimen.label}.swc`} target="_blank">{`${data.neuron.label}-${data.neuron.specimen.label}.swc`}</Anchor></Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">JSON</Table.Th>
                                <Table.Td><Anchor size="sm" href={`${data.neuron.specimen.referenceDataset.url}/specimen_space_reconstructions/json/${data.neuron.label}-${data.neuron.specimen.label}.json`} target="_blank">{`${data.neuron.label}-${data.neuron.specimen.label}.json`}</Anchor></Table.Td>
                            </Table.Tr>
                        </Table>
                    )}
                </Card.Section>
                <Card.Section>
                    <Tabs orientation="horizontal" value={activeTab} onChange={onChangeTab}>
                        <Tabs.List>
                            <Tabs.Tab value="atlas" leftSection={<IconBinaryTreeFilled size={18} style={{transform: "rotate(-90deg)"}}/>}>
                                Atlas-Space Reconstruction
                            </Tabs.Tab>
                            <Tabs.Tab value="specimen" leftSection={<IconBinaryTree size={18} style={{transform: "rotate(-90deg)"}}/>}>
                                Specimen-Space Reconstruction
                            </Tabs.Tab>
                            <Tabs.Tab value="quality" leftSection={<IconBinaryTree size={18} style={{transform: "rotate(-90deg)"}}/>}>
                                Quality Control & Metrics
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
                        <Tabs.Panel value="quality" key={`quality_${data.neuron.id}`}>
                            <QualityMetrics neuronId={data.neuron.id}/>
                        </Tabs.Panel>
                        <Tabs.Panel value="history" key={`history_${data.neuron.id}`}>
                            <NeuronHistory neuronId={data.neuron.id}/>
                        </Tabs.Panel>
                    </Tabs>
                </Card.Section>
            </Card>
        </Stack>
    );
}
