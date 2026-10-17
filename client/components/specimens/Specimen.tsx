import * as React from "react";
import {useParams} from "react-router-dom";
import {useQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Badge, Card, Center, Divider, Group, Stack, Table, Text, Tooltip} from "@mantine/core";
import {useClipboard} from "@mantine/hooks";
import dayjs from "dayjs";

import {SPECIMEN_QUERY, SpecimenQueryResponse, SpecimenQueryVariables} from "../../graphql/specimen";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";
import {AppLoading} from "../app/AppLoading";
import {useAppLayout} from "../../hooks/useAppLayout";
import {SpecimenTomographyView} from "./SpecimenTomographyView";
import {successNotification} from "../common/NotificationHelper";

const NONE = "(none)";
const UNSPECIFIED = "(unspecified)";

export const Specimen = observer(() => {
    const {specimenId} = useParams();

    const clipboard = useClipboard();

    const appLayout = useAppLayout();

    const {data, loading, error, previousData} = useQuery<SpecimenQueryResponse, SpecimenQueryVariables>(SPECIMEN_QUERY, {variables: {id: specimenId}});

    if (error) {
        return <GraphQLErrorAlert title="Specimen not Loaded" error={error}/>
    }

    if (loading && !previousData) {
        return <AppLoading message={`Loading specimen ${specimenId}`}/>
    }

    const specimen = data?.specimen ?? previousData.specimen;

    const date = specimen.referenceDate ? dayjs(specimen.referenceDate).format("YYYY-MM-DD") : NONE;

    const notes = specimen.notes || NONE;

    const genotype = specimen?.genotype ? specimen.genotype.name : NONE;

    const injectionCount = specimen.injections?.length;

    const neuronCount = `${specimen.neuronCount} neuron${specimen.neuronCount != 1 ? "s" : ""}`;

    // || rather than ??: the reference data set editor saves cleared fields as "" rather than null.
    const referenceUrl = specimen.referenceDataset?.url || NONE;

    const fragmentsUrl = specimen.referenceDataset?.segmentationUrl || NONE;

    const tomography = specimen.tomography?.url || NONE;

    const range = specimen.tomography?.options?.range ? `[${specimen.tomography.options.range[0]}, ${specimen.tomography.options.range[1]}]` : UNSPECIFIED;

    const window = specimen.tomography?.options?.window ? `[${specimen.tomography.options.window[0]}, ${specimen.tomography.options.window[1]}]` : UNSPECIFIED;

    const info = appLayout.showReferenceIds ? (
        <Badge variant="light" onClick={() => clipboard.copy(specimenId)}>{specimenId}</Badge>) : null;

    const simpleCell = (value: string) => {
        const props = (value == NONE || value == UNSPECIFIED) ? {c: "dimmed"} : {};
        return <Text size="sm" truncate="end" {...props}>{value}</Text>;
    }
    const copyableCell = (title: string, value: string) => {
        const props = value == NONE ? {c: "dimmed"} : {
            onClick: () => {
                clipboard.copy(value);
                successNotification(title, `${title} copied to clipboard`);
            }
        };
        return <Text size="sm" truncate="end" {...props}>{value}</Text>;
    }
    const simpleSomaCell = (value: number) => {
        const props = !value ? {c: "dimmed"} : {};
        return <Text size="sm" {...props}>{value ?? UNSPECIFIED}</Text>;
    }

    return (
        <Stack m={16}>
            <Card withBorder>
                <Card.Section bg="segment">
                    <Group p={12} justify="space-between">
                        <Stack gap={0}>
                            <Group align="center">
                                <Text size="lg" fw={500}>Specimen {specimen.label}</Text>
                                {info}
                            </Group>
                            <Text size="sm" c="dimmed">{specimen.collection.name} collection</Text>
                        </Stack>
                        <Badge bg="green">{neuronCount}</Badge>
                    </Group>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section>
                    <Group gap={0} align="flex-start">
                        <Table variant="vertical" w={380} withColumnBorders>
                            <Table.Tr>
                                <Table.Th bg="table-header">Date</Table.Th>
                                <Table.Td>{simpleCell(date)}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">Notes</Table.Th>
                                <Table.Td>{simpleCell(notes)}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">Genotype</Table.Th>
                                <Table.Td>{simpleCell(genotype)}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">Labels</Table.Th>
                                <Table.Td>{simpleCell(injectionCount > 0 ? `${injectionCount}` : NONE)}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th colSpan={2} ta="center">Soma Defaults</Table.Th>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">Brightness</Table.Th>
                                <Table.Td>{simpleSomaCell(specimen.somaProperties?.defaultBrightness)}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">Volume</Table.Th>
                                <Table.Td>{simpleSomaCell(specimen.somaProperties?.defaultVolume)}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th colSpan={2} ta="center">Reference Data Set</Table.Th>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">URL</Table.Th>
                                <Table.Td maw={220}><Tooltip label={referenceUrl}>{copyableCell("Reference Data Set URL", referenceUrl)}</Tooltip></Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">Segmentation URL</Table.Th>
                                <Table.Td maw={220}><Tooltip label={fragmentsUrl}>{copyableCell("Segmentation URL", fragmentsUrl)}</Tooltip></Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th colSpan={2} ta="center">Tomography</Table.Th>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">Source</Table.Th>
                                <Table.Td maw={220}><Tooltip label={tomography}>{copyableCell("Tomography Source", tomography)}</Tooltip></Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">Range</Table.Th>
                                <Table.Td>{simpleCell(range)}</Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Th bg="table-header">Window</Table.Th>
                                <Table.Td>{simpleCell(window)}</Table.Td>
                            </Table.Tr>
                        </Table>
                        <Divider orientation="vertical"/>
                        {specimen.tomography?.url ? <SpecimenTomographyView specimen={specimen}/> : <Center style={{flexGrow: 1}} m={20}>Tomography is not defined for this specimen.</Center>}
                    </Group>
                </Card.Section>
            </Card>
        </Stack>
    );
});
