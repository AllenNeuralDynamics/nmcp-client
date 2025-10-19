import React, {useState} from "react";
import {Navigate} from "react-router-dom";
import {observer} from "mobx-react-lite";
import {useQuery} from "@apollo/client";
import {Select, Group, Text, Card, Divider, SimpleGrid, Tooltip, ComboboxLikeRenderOptionInput, ComboboxItem, Badge} from "@mantine/core";

import {PaginationHeader} from "../../common/PaginationHeader";
import {PublishedTable} from "./PublishedTable";
import {GraphQLErrorAlert} from "../../common/GraphQLErrorAlert";
import {ReconstructionStatus} from "../../../models/reconstructionStatus";
import {RECONSTRUCTIONS_QUERY, ReconstructionQueryArgs, ReconstructionsResponse} from "../../../graphql/reconstruction";
import {Reconstruction} from "../../../models/reconstruction";
import {useUser} from "../../../hooks/useUser";
import {UserPermissions} from "../../../graphql/user";
import {AppLoading} from "../../app/AppLoading";
import {PublishedActions} from "./PublishedActions";

type StatusFilterType = "published" | "in-progress" | "publishable" | "finalizing";

const statusOptions = [
    {value: "published", label: "Published"},
    {value: "in-progress", label: "In Progress"},
    {value: "publishable", label: "Ready to Publish"},
    {value: "finalizing", label: "Waiting for Atlas Reconstruction"}
]

const getStatusFilters = (filterType: StatusFilterType): number[] => {
    switch (filterType) {
        case "published":
            return [ReconstructionStatus.Published];
        case "in-progress":
            return [ReconstructionStatus.Publishing];
        case "publishable":
            return [ReconstructionStatus.ReadyToPublish];
        case "finalizing":
            return [ReconstructionStatus.WaitingForAtlasReconstruction];
        default:
            return [];
    }
};

const getStatusTooltip = (filterType: StatusFilterType): string => {
    switch (filterType) {
        case "published":
            return "Available in the Portal";
        case "in-progress":
            return "Finalizing the search index.  Will automatically appear in the Portal when complete.";
        case "publishable":
            return "All preprocessing is complete.  The reconstruction can be manually published to the search index of the portal";
        case "finalizing":
            return "Approved but waiting for atlas reconstruction to complete the preparation process such as QC or generating the precomputed skeleton.";
        default:
            return "";
    }
};


function SelectItemWithTooltip(renderOptionInput: ComboboxLikeRenderOptionInput<ComboboxItem>) {
    return (
        <Tooltip label={getStatusTooltip(renderOptionInput.option.value as StatusFilterType)}>
            <Group w="100%">{renderOptionInput.option.label}</Group>
        </Tooltip>
    );
}

export const Published = observer(() => {
    const user = useUser();

    if ((user?.permissions & UserPermissions.Admin) == 0) {
        return <Navigate to="/" replace/>;
    }

    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(10);

    const [statusFilter, setStatusFilter] = useState<StatusFilterType>("published");

    const filters = getStatusFilters(statusFilter);

    const {data, previousData, loading, error} = useQuery<ReconstructionsResponse, ReconstructionQueryArgs>(
        RECONSTRUCTIONS_QUERY,
        {
            variables: {
                queryArgs: {
                    offset,
                    limit: limit,
                    userOnly: false,
                    status: filters
                }
            },
            pollInterval: 10000
        }
    );

    const handleStatusChange = async (value: string | null) => {
        setStatusFilter(value as StatusFilterType);
    };

    if (error) {
        return <GraphQLErrorAlert title="Reconstruction Data Could Not Be Loaded" error={error}/>;
    }

    if (loading && !previousData) {
        return <AppLoading message={"loading users..."}/>;
    }

    let source = loading ? previousData : data;

    const reconstructions: Reconstruction[] = source.reconstructions.reconstructions ?? [];
    const totalCount = source.reconstructions.total ?? 0;

    const pageCount = Math.max(Math.ceil(totalCount / limit), 1);
    const activePage = offset ? (Math.floor(offset / limit) + 1) : 1;
    const start = offset + 1;
    const end = Math.min(offset + limit, totalCount);

    return (
        <Card withBorder>
            <Card.Section bg="segment">
                <Group p={12} align="center">
                    <Text size="lg" fw={500}>Reconstructions</Text>
                    <Badge variant="light">{statusOptions.find(s => s.value == statusFilter)?.label}</Badge>
                </Group>
                <Divider orientation="horizontal"/>
            </Card.Section>
            <Card.Section bg="segment">
                <Group p={8}>
                    <Text>Status</Text>
                    <Select value={statusFilter} miw={300} allowDeselect={false} onChange={handleStatusChange} data={statusOptions}
                            renderOption={SelectItemWithTooltip}/>
                </Group>
            </Card.Section>
            <Card.Section bg="segment">
                <Divider/>
                <PaginationHeader total={pageCount} value={activePage} limit={limit} itemCount={totalCount}
                                  onLimitChange={(limit) => setLimit(limit)} onChange={(page) => setOffset((page - 1) * limit)}/>
            </Card.Section>
            {statusFilter === "publishable" ?
                <Card.Section bg="segment">
                    <Divider/>
                    <PublishedActions reconstructions={reconstructions} totalCount={totalCount}/>
                </Card.Section> : null}
            <Card.Section bg="segment">
                <PublishedTable reconstructions={reconstructions}/>
            </Card.Section>
            <Card.Section bg="segment">
                <SimpleGrid cols={2} p={8}>
                    <Text size="sm">
                        {totalCount == 0 ? "There are no matching reconstructions" : `Showing ${start} to ${end} of ${totalCount} reconstructions`}
                    </Text>
                    <Text size="sm" ta="end">{`Page ${activePage} of ${pageCount}`}</Text>
                </SimpleGrid>
            </Card.Section>
        </Card>
    );
});
