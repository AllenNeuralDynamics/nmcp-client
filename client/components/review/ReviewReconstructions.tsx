import * as React from "react";
import {useState} from "react";
import {useQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Card, Center, Divider, Group, SimpleGrid, Stack, Switch, Text} from "@mantine/core";

import {ReviewTable} from "./ReviewTable";
import {Selection} from "./reconstruction/Selection";
import {PaginationHeader} from "../common/PaginationHeader";
import {ReviewStatusFilter} from "../common/filters/ReviewStatusFilter";
import {OptionalFilter} from "../../viewmodel/candidateFilter";
import {SpecimenFilter} from "../common/filters/SpecimenFilter";
import {useUser} from "../../hooks/useUser";
import {UserPermissions} from "../../graphql/user";
import {NeuronTagFilter} from "../common/filters/NeuronTagFilter";
import {hasPermission} from "../../models/user";
import {availableReviewEntries, reviewStatusFilters} from "./reviewAccess";
import {ANNOTATIONS_QUERY, AnnotationQueryArgs, AnnotationsResponse} from "../../graphql/annotation";
import {Annotation} from "../../models/annotation";
import {ReviewActions} from "./ReviewActions";
import {Navigate} from "react-router-dom";
import {usePageSettings} from "../../hooks/usePageSettings";
import {useSettingsMirror} from "../../hooks/useSettingsMirror";
import {useOffsetReset} from "../../hooks/useOffsetReset";
import {ResetFiltersButton} from "../common/ResetFiltersButton";
import {ReviewSettings} from "./reviewSettings";

export const ReviewReconstructions = observer(() => {
    const user = useUser();

    const havePeer = hasPermission(user?.permissions, UserPermissions.PeerReview);
    const haveFull = hasPermission(user?.permissions, UserPermissions.PublishReview);

    if (!havePeer && !haveFull) {
        return <Navigate to="/" replace={true}/>;
    }

    const [settings, update] = usePageSettings(ReviewSettings);

    const {offset, limit} = settings.pagination;

    const selectedId = settings.selectedId;

    // A stored Approval Only applies only for a user who can see the switch, and is kept for when they can.
    const approvalOnly = haveFull && settings.filters.approvalOnly;

    const [specimenFilter] = useState(() => OptionalFilter.fromSettings(settings.filters.specimens));
    const [statusFilter] = useState(() => OptionalFilter.fromSettings(settings.filters.statuses));
    const [tagFilter] = useState(() => OptionalFilter.fromSettings(settings.filters.keywords));

    const [filterGeneration, setFilterGeneration] = useState(0);

    useSettingsMirror(() => ({specimens: specimenFilter.settings, keywords: tagFilter.settings, statuses: statusFilter.settings}),
        mirrored => update(s => ({...s, filters: {...s.filters, ...mirrored}})));

    const setOffset = (offset: number) => update(s => ({...s, pagination: {...s.pagination, offset}}));

    const setLimit = (limit: number) => update(s => ({...s, pagination: {...s.pagination, limit}}));

    const available = availableReviewEntries({peer: havePeer, publish: haveFull}, approvalOnly);

    const statusFilters = reviewStatusFilters(available, statusFilter.isEnabled ? statusFilter.contents : null);

    const sampleIds = specimenFilter.isEnabled ? specimenFilter.contents : [];

    const tag = tagFilter.isEnabled ? [tagFilter.contents] : [];

    const {data, loading, error, previousData} = useQuery<AnnotationsResponse, AnnotationQueryArgs>(ANNOTATIONS_QUERY, {
        variables: {queryArgs: {offset: offset, limit: limit, specimenIds: sampleIds, statusFilters, keywords: tag}},
        pollInterval: 10000
    });

    useOffsetReset(offset, data?.annotations.total, () => setOffset(0));

    if (error) {
        return (<div>
            <span>{error.message}</span>
            {error.graphQLErrors?.map(({message}, i) => (
                <span key={i}>{message}</span>))}
        </div>)
    }

    const reconstructionCache = (loading && previousData ? previousData.annotations.annotations : data?.annotations.annotations) || [];
    const totalCount = (loading && previousData ? previousData.annotations.total : data?.annotations.total) || 0;

    const selection: Annotation = selectedId ? (reconstructionCache.find(r => r.id === selectedId) ?? null) : null;

    const onRowClick = (reconstruction: Annotation) => {
        update(s => ({...s, selectedId: reconstruction?.id ?? null}));
    }

    const resetFilters = () => {
        specimenFilter.apply(ReviewSettings.defaults.filters.specimens);
        tagFilter.apply(ReviewSettings.defaults.filters.keywords);
        statusFilter.apply(ReviewSettings.defaults.filters.statuses);
        update(s => ({...s, filters: {...s.filters, approvalOnly: false}, pagination: {...s.pagination, offset: 0}}));
        setFilterGeneration(g => g + 1);
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
                            <Switch label="Approval Only" checked={settings.filters.approvalOnly}
                                    onChange={(evt) => {
                                        const checked = evt.currentTarget.checked;
                                        update(s => ({...s, filters: {...s.filters, approvalOnly: checked}}));
                                    }}/> : null}
                        <SpecimenFilter w={300} filter={specimenFilter}/>
                        <Divider orientation="vertical"/>
                        <NeuronTagFilter key={filterGeneration} filter={tagFilter}/>
                        <Divider orientation="vertical"/>
                        {haveFull ? <ReviewStatusFilter w={300} filter={statusFilter} available={available}/> : null}
                        <Group ml="auto">
                            <ResetFiltersButton onReset={resetFilters}/>
                        </Group>
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
                        <Selection reconstruction={selection} tab={settings.detailTab} onTabChange={tab => update(s => ({...s, detailTab: tab}))}/>
                    </Card.Section>
                    : null
                }
            </Card>
        </Stack>
    );
});
