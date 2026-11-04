import * as React from "react";
import {useEffect, useMemo} from "react";
import {Navigate, useLocation, useNavigate, useParams} from "react-router-dom";
import {ApolloError, useQuery} from "@apollo/client";
import {Alert, Anchor, Badge, Card, Divider, Group, Stack, Tabs, Text} from "@mantine/core";
import {useClipboard, useLocalStorage} from "@mantine/hooks";
import {useIsAuthenticated} from "@azure/msal-react";
import {IconBinaryTree, IconBinaryTreeFilled, IconChartBar, IconVersions} from "@tabler/icons-react";
import dayjs from "dayjs";

import {
    NEURON_PUBLIC_QUERY,
    NEURON_VERSIONS_QUERY,
    NeuronVersionsQueryResponse,
    NeuronVersionsQueryVariables
} from "../../graphql/neuron";
import {NeuronShape} from "../../models/neuron";
import {Annotation} from "../../models/annotation";
import {AnnotationStatus} from "../../models/annotationStatus";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";
import {AppLoading} from "../app/AppLoading";
import {useAppLayout} from "../../hooks/useAppLayout";
import {NeuronSpecimenSpaceView} from "./NeuronSpecimenSpaceView";
import {NeuronAtlasSpaceView} from "./NeuronAtlasSpaceView";
import {NeuronLinkState, OpenAtlasTabSearchParam} from "../common/NeuronVersionLink";
import {NeuronHistory} from "./NeuronHistory";
import {QualityMetrics} from "./QualityMetrics";
import {ReconstructionMetrics} from "./ReconstructionMetrics";
import {NeuronDownloadMenu} from "./NeuronDownloadMenu";
import {useSystemConfiguration} from "../../hooks/useSystemConfiguration";
import {successNotification} from "../common/NotificationHelper";

// Each level down to the active tab panel fills the remaining page height, so the Neuroglancer views can grow into it.
const FillColumn: React.CSSProperties = {flexGrow: 1, display: "flex", flexDirection: "column"};

const ExcludedStatuses = new Set([
    AnnotationStatus.Archived,
    AnnotationStatus.Discarded,
    AnnotationStatus.OnHold,
]);

function selectReconstruction(reconstructions: Annotation[], versionId: string): Annotation | null {
    if (!reconstructions || reconstructions.length === 0) {
        return null;
    }

    if (versionId && versionId !== "latest") {
        return reconstructions.find(r => r.id === versionId) ?? null;
    }

    const published = reconstructions.find(r => r.status === AnnotationStatus.Published);

    if (published) {
        return published;
    }

    const eligible = reconstructions
        .filter(r => !ExcludedStatuses.has(r.status))
        .sort((a, b) => (b.status as number) - (a.status as number));

    return eligible.length > 0 ? eligible[0] : null;
}

type NeuronPageData = {
    neuron?: NeuronShape;
    error?: ApolloError;
}

// Signed-out users never receive the annotation list, only the published annotation when there is one, and the page then
// treats it as the only version.
function useNeuronPageData(neuronId: string, isAuthenticated: boolean): NeuronPageData {
    const options = {pollInterval: 10000, variables: {id: neuronId}};

    const versions = useQuery<NeuronVersionsQueryResponse, NeuronVersionsQueryVariables>(NEURON_VERSIONS_QUERY, {
        ...options,
        skip: !isAuthenticated
    });

    const publicNeuron = useQuery<NeuronVersionsQueryResponse, NeuronVersionsQueryVariables>(NEURON_PUBLIC_QUERY, {
        ...options,
        skip: isAuthenticated
    });

    return useMemo(() => {
        if (isAuthenticated) {
            return {neuron: versions.data?.neuron, error: versions.error};
        }

        const neuron = publicNeuron.data?.neuron;

        if (!neuron) {
            return {error: publicNeuron.error};
        }

        return {
            neuron: {...neuron, annotations: neuron.published ? [neuron.published] : []},
            error: publicNeuron.error
        };
    }, [isAuthenticated, versions.data, versions.error, publicNeuron.data, publicNeuron.error]);
}

export const Neuron = () => {
    const {neuronId, versionId} = useParams();

    const location = useLocation();
    const navigate = useNavigate();

    const clipboard = useClipboard();

    const appLayout = useAppLayout();

    const [activeTab, setActiveTab] = useLocalStorage<string>({
        key: "nmcp-neuron-active-tab",
        defaultValue: "atlas"
    });

    const isAuthenticated = useIsAuthenticated();

    const systemConfiguration = useSystemConfiguration();

    const {neuron, error} = useNeuronPageData(neuronId, isAuthenticated);

    const data = neuron ? {neuron} : null;

    const selectedReconstruction = useMemo(() => {
        if (!data?.neuron?.annotations) {
            return null;
        }
        return selectReconstruction(data.neuron.annotations, versionId);
    }, [data?.neuron?.annotations, versionId]);

    const invalidVersion = (location.state as any)?.invalidVersion as string | undefined;

    const openAtlasTab = (location.state as NeuronLinkState | null)?.openAtlasTab === true ||
        new URLSearchParams(location.search).get(OpenAtlasTabSearchParam) == "true";

    useEffect(() => {
        if (openAtlasTab) {
            setActiveTab("atlas");
            // Clear it so a refresh restores the last tab used instead of forcing the atlas tab again.
            navigate(location.pathname, {replace: true, state: {}});
        }
        // mount-only; intentionally not re-running on openAtlasTab changes
    }, []);

    const onChangeTab = (tab: string) => {
        setActiveTab(tab);
    }

    if (error) {
        return <GraphQLErrorAlert title="Neuron Data Could not be Loaded" error={error}/>;
    }

    if (!data?.neuron) {
        return <AppLoading message="Loading Neuron..."/>;
    }

    if (versionId && versionId !== "latest" && !selectedReconstruction && data.neuron.annotations) {
        // A signed-out user's link to an unpublished version lands on the neuron itself, without confirming the version exists.
        return <Navigate to={`/neuron/${neuronId}`} replace state={isAuthenticated ? {invalidVersion: versionId} : {}}/>;
    }

    const info = appLayout.showReferenceIds ? (
        <Badge variant="light" onClick={() => clipboard.copy(data.neuron.id)}>{data.neuron.id}</Badge>) : null;

    const isPublished = data.neuron.published != null;

    const published = isPublished ? `Published ${dayjs(data.neuron.published.atlasReconstruction.searchIndexedAt).format("YYYY-MM-DD")}` : "Unpublished";

    const qualityControlId = selectedReconstruction?.atlasReconstruction?.qualityControl?.id;

    const showAnnotation = isAuthenticated || selectedReconstruction != null;

    // History lists every version, so it is not offered to signed-out users even if it was the last tab used.
    const currentTab = !isAuthenticated && activeTab == "history" ? "atlas" : activeTab;

    return (
        <Stack p={20} align="stretch" style={{flexGrow: 1}}>
            {invalidVersion && (
                <Alert color="orange" title="Version Not Found" withCloseButton
                       onClose={() => navigate(location.pathname, {replace: true, state: {}})}>
                    Reconstruction version &quot;{invalidVersion}&quot; was not found. Showing the default version.
                </Alert>
            )}
            <Card withBorder style={showAnnotation ? {flexGrow: 1} : undefined}>
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
                            {isPublished && data.neuron.canonicalDoi ?
                                <Group gap={2}>
                                    <Text size="sm">Canonical DOI:</Text>
                                    <Text size="sm" c="dimmed" td="underline" style={{cursor: "pointer"}}
                                          onClick={() => {
                                              clipboard.copy(`${systemConfiguration.doiHandler}/${data.neuron.canonicalDoi}`);
                                              successNotification("DOI", "DOI copied to clipboard");
                                          }}>{`${systemConfiguration.doiHandler}/${data.neuron.canonicalDoi}`}</Text>
                                </Group> : null}
                            {isPublished && data.neuron.published.doi ?
                                <Group gap={2}>
                                    <Text size="sm">Version-Specific DOI:</Text>
                                    <Text size="sm" c="dimmed" td="underline" style={{cursor: "pointer"}}
                                          onClick={() => {
                                              clipboard.copy(`${systemConfiguration.doiHandler}/${data.neuron.published.doi}`);
                                              successNotification("DOI", "DOI copied to clipboard");
                                          }}>{`${systemConfiguration.doiHandler}/${data.neuron.published.doi}`}</Text>
                                </Group> : null}
                        </Stack>
                    </Group>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section p={0}  bg="segment">
                    <Group p={12} justify="space-between" align="center">
                        <Group gap={32} align="baseline">
                            <Group gap={8} align="baseline">
                                <Text fw={500}>Open Dataset</Text>
                                {isPublished && data.neuron.specimen.referenceDataset?.url ?
                                    <Anchor size="sm" href={data.neuron.specimen.referenceDataset.url} target="_blank">{data.neuron.specimen.referenceDataset.url}</Anchor> :
                                    <Text c="dimmed" size="sm">Not available.</Text>}
                            </Group>
                            <Group gap={8} align="baseline">
                                <Text fw={500}>Segmentation</Text>
                                {data.neuron.specimen.referenceDataset?.segmentationUrl ?
                                    <Anchor size="sm" href={data.neuron.specimen.referenceDataset.segmentationUrl} target="_blank">{data.neuron.specimen.referenceDataset.segmentationUrl}</Anchor> :
                                    <Text c="dimmed" size="sm">Not available.</Text>}
                            </Group>
                        </Group>
                        {showAnnotation ? <NeuronDownloadMenu reconstruction={selectedReconstruction}/> : null}
                    </Group>
                </Card.Section>
                {showAnnotation ? (
                    <Card.Section style={FillColumn}>
                        <Tabs orientation="horizontal" value={currentTab} onChange={onChangeTab} style={FillColumn}>
                            <Tabs.List>
                                <Tabs.Tab value="atlas" leftSection={<IconBinaryTreeFilled size={18} style={{transform: "rotate(-90deg)"}}/>}>
                                    Atlas-Space Reconstruction
                                </Tabs.Tab>
                                <Tabs.Tab value="specimen" leftSection={<IconBinaryTree size={18} style={{transform: "rotate(-90deg)"}}/>}>
                                    Specimen-Space Reconstruction
                                </Tabs.Tab>
                                <Tabs.Tab value="quality" leftSection={<IconBinaryTree size={18} style={{transform: "rotate(-90deg)"}}/>}>
                                    Quality Control
                                </Tabs.Tab>
                                <Tabs.Tab value="metrics" leftSection={<IconChartBar size={18}/>}>
                                    Metrics
                                </Tabs.Tab>
                                {isAuthenticated ?
                                    <Tabs.Tab value="history" leftSection={<IconVersions size={18}/>}>
                                        History
                                    </Tabs.Tab> : null}
                            </Tabs.List>

                            <Tabs.Panel value="atlas" style={FillColumn} key={`atlas_${data.neuron.id}`}>
                                <NeuronAtlasSpaceView atlasId={data.neuron.specimen.atlasId}
                                                      reconstruction={selectedReconstruction}
                                                      soma={data.neuron.atlasSoma}/>
                            </Tabs.Panel>
                            <Tabs.Panel value="specimen" style={FillColumn} key={`specimen_${data.neuron.id}`}>
                                <NeuronSpecimenSpaceView neuron={data.neuron} reconstruction={selectedReconstruction}/>
                            </Tabs.Panel>
                            <Tabs.Panel value="quality" style={FillColumn} key={`quality_${data.neuron.id}`}>
                                <QualityMetrics qualityControlId={qualityControlId}/>
                            </Tabs.Panel>
                            <Tabs.Panel value="metrics" style={FillColumn} key={`metrics_${data.neuron.id}`}>
                                <ReconstructionMetrics reconstructionId={selectedReconstruction?.atlasReconstruction?.id}/>
                            </Tabs.Panel>
                            {isAuthenticated ?
                                <Tabs.Panel value="history" style={FillColumn} key={`history_${data.neuron.id}`}>
                                    <NeuronHistory neuronId={data.neuron.id}/>
                                </Tabs.Panel> : null}
                        </Tabs>
                    </Card.Section>
                ) : null}
            </Card>
        </Stack>
    );
}
