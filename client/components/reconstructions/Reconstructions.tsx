import * as React from "react";
import {useState} from "react";
import {useQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Card, Center, Divider, Group, Loader, SimpleGrid, Stack, Text} from "@mantine/core";

import {usePreferences} from "../../hooks/usePreferences";
import {useUser} from "../../hooks/useUser";
import {PaginationHeader} from "../common/PaginationHeader";
import {RequestReviewModal} from "./RequestReviewModal";
import {ReconstructionActions} from "./ReconstructionActions";
import {OptionalFilter} from "../../viewmodel/candidateFilter";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";
import {Reconstruction} from "../../models/reconstruction";
import {RECONSTRUCTIONS_QUERY, ReconstructionQueryArgs, ReconstructionsResponse} from "../../graphql/reconstruction";
import {ReconstructionFilters} from "./ReconstructionFilters";
import {ReconstructionTable} from "./ReconstructionTable";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {UserPermissions} from "../../graphql/user";
import {Navigate} from "react-router-dom";

function noReconstructionsText(userOnly: boolean, haveFilters: boolean) {
    return userOnly || haveFilters ? "There are no reconstructions that match the filters" : "There are no reconstructions";
}

export const Reconstructions = observer(() => {
    const preferences = usePreferences();
    const user = useUser();

    if (!user || ((user.permissions & UserPermissions.ViewReconstructions) == 0)) {
        return <Navigate to="/" replace/>;
    }

    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(10);

    const [userOnly, setUserOnly] = useState(preferences.ReconstructionNeuronsUserOnly);

    const [specimenFilter] = useState(new OptionalFilter<string[]>([]));
    const [statusFilter] = useState(new OptionalFilter<number[]>([]));

    const [selection, setSelection] = useState<string>(null);

    const [isCompleteDialogVisible, setIsCompleteDialogVisible] = useState(false);

    const [reviewRequestId, setReviewRequestId] = useState("");
    const [reviewRequestStatus, setReviewRequestStatus] = useState<ReconstructionStatus>(ReconstructionStatus.Initialized);

    const status: number[] = statusFilter.isEnabled ? statusFilter.contents : []

    const sampleIds = specimenFilter.isEnabled ? specimenFilter.contents : [];

    const {data, error, previousData} = useQuery<ReconstructionsResponse, ReconstructionQueryArgs>(RECONSTRUCTIONS_QUERY, {
        variables: {queryArgs: {offset: offset, limit: limit, userOnly: userOnly, status: status, specimenIds: sampleIds}},
        pollInterval: 10000
    });

    if (error) {
        return <GraphQLErrorAlert title="Candidate Data Could Not Be Loaded" error={error}/>;
    }

    let reconstructionCache: Reconstruction[];
    let totalCount: number;

    if (data?.reconstructions.reconstructions) {
        reconstructionCache = data.reconstructions.reconstructions;
        totalCount = data.reconstructions.total;
    } else {
        if (previousData) {
            reconstructionCache = previousData.reconstructions.reconstructions;
            totalCount = previousData.reconstructions.total;
        } else {
            return <Center><Loader type="dots"/></Center>;
        }
    }

    const onUserOnlyChange = (userOnly: boolean) => {
        preferences.ReconstructionNeuronsUserOnly = userOnly;
        setUserOnly(userOnly)
    }
    const onSelected = (reconstruction: Reconstruction) => {
        if ((reconstruction?.id ?? null) != selection) {
            setSelection(reconstruction?.id ?? null);
        }
    }

    let selectedReconstruction = null;

    reconstructionCache.map(r => {
        if (r.id == selection) {
            selectedReconstruction = r;
        }
    });

    const completeDialog = isCompleteDialogVisible ? (
        <RequestReviewModal id={reviewRequestId} show={true} requestedStatus={reviewRequestStatus} onClose={() => setIsCompleteDialogVisible(false)}/>) : null;

    const pageCount = Math.max(Math.ceil(totalCount / limit), 1);

    const activePage = Math.min(offset ? (Math.floor(offset / limit) + 1) : 1, pageCount);

    const start = offset + 1;

    const end = Math.min(offset + limit, totalCount);

    return (
        <Stack m={16}>
            {completeDialog}
            <Card withBorder>
                <Card.Section bg="segment">
                    <Group p={12}>
                        <Text size="lg" fw={500}>Reconstructions</Text>
                    </Group>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section bg="segment">
                    <ReconstructionFilters checked={userOnly} onChange={evt => onUserOnlyChange(evt.currentTarget.checked)} filter={specimenFilter}
                                           filter1={statusFilter}/>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section bg="segment">
                    <PaginationHeader total={pageCount} value={activePage} limit={limit} itemCount={totalCount}
                                      onLimitChange={v => setLimit(v)} onChange={p => setOffset((p - 1) * limit)}/>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section bg="segment">
                    <ReconstructionActions reconstruction={selectedReconstruction} userId={user.id}
                                           showRequestReviewDialog={(id: string, status: ReconstructionStatus) => {
                                               setReviewRequestId(id);
                                               setReviewRequestStatus(status);
                                               setIsCompleteDialogVisible(true);
                                           }}/>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section>
                    {reconstructionCache.length > 0 ?
                        <ReconstructionTable reconstructions={reconstructionCache} selectedId={selection} onSelected={onSelected}/> :
                        <Center><Text p={12} c="dimmed">{noReconstructionsText(userOnly, status.length > 0)}</Text></Center>}
                    <Divider orientation="horizontal"/>
                </Card.Section>
                {reconstructionCache.length > 0 ?
                    <Card.Section bg="segment">
                        <SimpleGrid cols={2} p={8}>
                            <Text size="sm">
                                {`Showing ${start} to ${end} of ${totalCount} reconstructions`}
                            </Text>
                            <Text size="sm" ta="end">{`Page ${activePage} of ${pageCount}`}</Text>
                        </SimpleGrid>
                    </Card.Section> : null}
            </Card>
        </Stack>
    );
});

