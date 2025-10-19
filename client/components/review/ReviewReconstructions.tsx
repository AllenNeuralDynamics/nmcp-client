import * as React from "react";
import {useState} from "react";
import {useQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Card, Center, Divider, Group, SimpleGrid, Stack, Switch, Text} from "@mantine/core";

import {ReviewTable} from "./ReviewTable";
import {Selection} from "./reconstruction/Selection";
import {PaginationHeader} from "../common/PaginationHeader";
import {ReconstructionStatusFilter} from "../common/filters/ReconstructionStatusFilter";
import {OptionalFilter} from "../../viewmodel/candidateFilter";
import {SpecimenFilter} from "../common/filters/SpecimenFilter";
import {useUser} from "../../hooks/useUser";
import {UserPermissions} from "../../graphql/user";
import {NeuronTagFilter} from "../common/filters/NeuronTagFilter";
import {ReconstructionStatus} from "../../models/reconstructionStatus";
import {RECONSTRUCTIONS_QUERY, ReconstructionQueryArgs, ReconstructionsResponse} from "../../graphql/reconstruction";
import {Reconstruction} from "../../models/reconstruction";
import {ReviewActions} from "./ReviewActions";
import {Navigate} from "react-router-dom";

const fullAllowedStatus = [ReconstructionStatus.PublishReview, ReconstructionStatus.Approved, ReconstructionStatus.WaitingForAtlasReconstruction, ReconstructionStatus.ReadyToPublish];
const peerAllowedStatus = [ReconstructionStatus.PeerReview];

const approvalOnlyFull = [ReconstructionStatus.PublishReview, ReconstructionStatus.Approved, ReconstructionStatus.ReadyToPublish];
const approvalOnlyPeer = [ReconstructionStatus.PeerReview];

function myAllowedStatus(approvalOnly: boolean, full: boolean, peer: boolean) {
    if (full) {
        if (approvalOnly) {
            return peer ? [...approvalOnlyPeer, ...approvalOnlyFull] : approvalOnlyFull;
        } else {
            return peer ? [...peerAllowedStatus, ...fullAllowedStatus] : fullAllowedStatus;
        }
    }

    return peerAllowedStatus;
}

export const ReviewReconstructions = observer(() => {
    const user = useUser();

    const havePeer = (user?.permissions & UserPermissions.PeerReview) != 0;
    const haveFull = (user?.permissions & UserPermissions.FullReview) != 0;

    if (!havePeer && !haveFull) {
        return <Navigate to="/" replace={true}/>;
    }

    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(10);

    const [approvalOnly, setApprovalOnly] = useState(false);

    const [specimenFilter] = useState(new OptionalFilter<string[]>([]));
    const [statusFilter] = useState(new OptionalFilter<number[]>([]));
    const [tagFilter] = useState(new OptionalFilter<string>(""));

    const [selectedId, setSelectedId] = useState<string>(null);

    const allowedStatus = myAllowedStatus(approvalOnly, haveFull, havePeer);

    const statusFilters: number[] = (statusFilter.isEnabled && statusFilter.contents.length > 0) ? statusFilter.contents : allowedStatus;

    const sampleIds = specimenFilter.isEnabled ? specimenFilter.contents : [];

    const tag = tagFilter.isEnabled ? [tagFilter.contents] : [];

    const {data, loading, error, previousData} = useQuery<ReconstructionsResponse, ReconstructionQueryArgs>(RECONSTRUCTIONS_QUERY, {
        variables: {queryArgs: {offset: offset, limit: limit, specimenIds: sampleIds, status: statusFilters, keywords: tag}},
        pollInterval: 10000
    });

    if (error) {
        return (<div>
            <span>{error.message}</span>
            {error.graphQLErrors?.map(({message}, i) => (
                <span key={i}>{message}</span>))}
        </div>)
    }

    const reconstructionCache = (loading && previousData ? previousData.reconstructions.reconstructions : data?.reconstructions.reconstructions) || [];
    const totalCount = (loading && previousData ? previousData.reconstructions.total : data?.reconstructions.total) || 0;

    let selection: Reconstruction = null;

    if (selectedId) {
        selection = reconstructionCache.find(r => r.id === selectedId) ?? null;
    }

    const onRowClick = (reconstruction: Reconstruction) => {
        if ((reconstruction?.id ?? null) != selectedId) {
            setSelectedId(reconstruction?.id ?? null);
        }
    }

    const pageCount = Math.max(Math.ceil(totalCount / limit), 1);

    const activePage = Math.min(offset ? (Math.floor(offset / limit) + 1) : 1, pageCount);

    const start = offset + 1;

    const end = Math.min(offset + limit, totalCount);

    return (
        <Stack m={20}>
            <Card withBorder>
                <Card.Section bg="segment" p={12}>
                    <Text size="xl" fw={500}>Reconstructions Submitted for Review</Text>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section bg="segment">
                    <Group justify="start" p={12}>
                        {haveFull ?
                            <Switch label="Approval Only" checked={approvalOnly} onChange={(evt) => setApprovalOnly(evt.currentTarget.checked)}/> : null}
                        <SpecimenFilter w={300} filter={specimenFilter}/>
                        <Divider orientation="vertical"/>
                        <NeuronTagFilter filter={tagFilter}/>
                        <Divider orientation="vertical"/>
                        {haveFull ? <ReconstructionStatusFilter w={300} filter={statusFilter} allowedValues={allowedStatus}/> : null}
                    </Group>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section bg="segment">
                    <PaginationHeader total={pageCount} value={activePage} limit={limit} itemCount={totalCount} onLimitChange={v => setLimit(v)}
                                      onChange={p => setOffset((p - 1) * limit)}/>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                {reconstructionCache.length > 0 ?
                    <Card.Section bg="segment">
                        <ReviewActions reconstruction={selection}/>
                        <Divider orientation="horizontal"/>
                    </Card.Section> : null}
                <Card.Section bg="segment">
                    {reconstructionCache.length > 0 ?
                        <ReviewTable reconstructions={reconstructionCache} selected={selection}
                                     totalCount={totalCount} offset={offset} limit={limit} onRowClick={onRowClick}
                                     isFiltered={specimenFilter.isEnabled || statusFilter.isEnabled}/> :
                        <Center p={24}><Text c="dimmed">There are no reviewable reconstructions.</Text></Center>}
                </Card.Section>
                {reconstructionCache.length > 0 ?
                    <Card.Section bg="segment">
                        <Divider orientation="horizontal"/>
                        <SimpleGrid cols={2} p={8}>
                            <Text size="sm">
                                {`Showing ${start} to ${end} of ${totalCount} reconstructions`}
                            </Text>
                            <Text size="sm" ta="end">{`Page ${activePage} of ${pageCount}`}</Text>
                        </SimpleGrid>
                    </Card.Section> : null}
                {selection ?
                    <Card.Section bg="segment">
                        <Divider orientation="horizontal"/>
                        <Selection reconstruction={selection}/>
                    </Card.Section>
                    : null
                }
            </Card>
        </Stack>
    );
});
