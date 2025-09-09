import React, {useState} from "react";
import {useQuery} from "@apollo/client";
import {
    Table,
    Select,
    Pagination,
    Container,
    Group,
    Text,
    Badge,
    Loader,
    Alert,
    Center,
    Stack,
    Card, Box
} from "@mantine/core";
import {
    RECONSTRUCTIONS_QUERY,
    ReconstructionsResponse,
    ReconstructionVariables
} from "../../../graphql/reconstruction";
import {
    ReconstructionStatus,
    reconstructionStatusString,
    reconstructionStatusColor
} from "../../../models/reconstructionStatus";
import {displayNeuron} from "../../../models/neuron";
import {displayBrainArea} from "../../../models/brainArea";
import {IReconstruction} from "../../../models/reconstruction";
import moment from "moment/moment";

type StatusFilterType = "published" | "pending";

const getStatusFilters = (filterType: StatusFilterType): number[] => {
    switch (filterType) {
        case "published":
            return [ReconstructionStatus.Published];
        case "pending":
            return [
                ReconstructionStatus.PendingStructureAssignment,
                ReconstructionStatus.PendingSearchContents,
                ReconstructionStatus.PendingPrecomputed
            ];
        default:
            return [];
    }
};

export const PublishedTable = () => {
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>("published");

    const offset = (page - 1) * pageSize;
    const filters = getStatusFilters(statusFilter);

    const {loading, error, data} = useQuery<ReconstructionsResponse, ReconstructionVariables>(
        RECONSTRUCTIONS_QUERY,
        {
            variables: {
                pageInput: {
                    offset,
                    limit: pageSize,
                    userOnly: false,
                    filters
                }
            },
            pollInterval: 10000
        }
    );

    const handleStatusChange = (value: string | null) => {
        if (value) {
            setStatusFilter(value as StatusFilterType);
            setPage(1);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    if (error) {
        return (
            <Container>
                <Alert color="red" title="Error">
                    Failed to load reconstructions: {error.message}
                </Alert>
            </Container>
        );
    }

    const reconstructions = data?.reconstructions.reconstructions || [];
    const totalCount = data?.reconstructions.totalCount || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <Container fluid p="4">
            <Stack gap={0}>
                <Group p="8" justify="space-between" align="center" bg="segment.9" bd="1px solid #ddd" bdrs="4 4 0 0">
                    <Text size="xl" fw={600}>
                        Published Reconstructions {statusFilter === "published" ? "" : "(In Progress)"}
                    </Text>
                </Group>

                <Group p="8" justify="start" align="center" bg="segment.9"
                       style={{borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd"}}>
                    <Text>Status Filter</Text>
                    <Select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        data={[
                            {value: "published", label: "Published"},
                            {value: "pending", label: "Pending"}
                        ]}
                        w={200}
                    />
                </Group>

                {loading ? (
                    <Center h={200}>
                        <Loader size="lg"/>
                    </Center>
                ) : (
                    <Box style={{
                        borderLeft: "1px solid #ddd",
                        borderRight: "1px solid #ddd",
                        borderBottom: "1px solid #ddd"
                    }} bdrs="0 0 4 4">
                        {reconstructions.length === 0 ? (
                            <Center h={200}>
                                <Text c="dimmed">No reconstructions found</Text>
                            </Center>
                        ) : (
                            <Box>
                                <Group p="8" justify="start" align="center" bg="segment.9"
                                       style={{borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd"}}>
                                    {totalPages > 1 && (<Pagination value={page} onChange={handlePageChange} total={totalPages} size="sm"/>)}
                                </Group>
                                <Table>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Neuron</Table.Th>
                                            <Table.Th>Subject</Table.Th>
                                            <Table.Th>Brain Area</Table.Th>
                                            <Table.Th>Soma X</Table.Th>
                                            <Table.Th>Soma Y</Table.Th>
                                            <Table.Th>Soma Z</Table.Th>
                                            <Table.Th>Axon Nodes</Table.Th>
                                            <Table.Th>Dendrite Nodes</Table.Th>
                                            <Table.Th>Annotator</Table.Th>
                                            <Table.Th>Status</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {reconstructions.map((reconstruction: IReconstruction) => (
                                            <Table.Tr key={reconstruction.id}>
                                                <Table.Td>
                                                    {displayNeuron(reconstruction.neuron)}
                                                </Table.Td>
                                                <Table.Td>
                                                    {reconstruction.neuron.sample.animalId}
                                                </Table.Td>
                                                <Table.Td>
                                                    {displayBrainArea(reconstruction.neuron.brainArea, "(unspecified)")}
                                                </Table.Td>
                                                <Table.Td>
                                                    {reconstruction.neuron.x.toFixed(1)}
                                                </Table.Td>
                                                <Table.Td>
                                                    {reconstruction.neuron.y.toFixed(1)}
                                                </Table.Td>
                                                <Table.Td>
                                                    {reconstruction.neuron.z.toFixed(1)}
                                                </Table.Td>
                                                <Table.Td>
                                                    {reconstruction.axon ? reconstruction.axon.nodeCount : "-"}
                                                </Table.Td>
                                                <Table.Td>
                                                    {reconstruction.dendrite ? reconstruction.dendrite.nodeCount : "-"}
                                                </Table.Td>
                                                <Table.Td>
                                                    {`${reconstruction.annotator.firstName} ${reconstruction.annotator.lastName}`}
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge
                                                        color={reconstructionStatusColor(reconstruction.status) || "gray"}
                                                        variant="light"
                                                    >
                                                        {reconstructionStatusString(reconstruction.status)}
                                                    </Badge>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>

                                <Group justify="space-between" align="center" bg="segment.9" p="8">
                                    <Text size="sm">
                                        Showing {reconstructions.length} of {totalCount} reconstructions
                                    </Text>
                                </Group>
                            </Box>
                        )}
                    </Box>
                )}
            </Stack>
        </Container>
    );
};
