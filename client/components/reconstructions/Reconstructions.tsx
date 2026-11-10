import * as React from "react";
import {useEffect, useState} from "react";
import {useQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Card, Center, Divider, Group, Loader, SimpleGrid, Stack, Text} from "@mantine/core";

import {useUser} from "../../hooks/useUser";
import {PaginationHeader} from "../common/PaginationHeader";
import {RequestReviewModal} from "./RequestReviewModal";
import {ReconstructionActions} from "./ReconstructionActions";
import {OptionalFilter} from "../../viewmodel/candidateFilter";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";
import {Annotation} from "../../models/annotation";
import {ANNOTATIONS_QUERY, AnnotationQueryArgs, AnnotationsResponse} from "../../graphql/annotation";
import {ReconstructionFilters} from "./ReconstructionFilters";
import {ResetFiltersButton} from "../common/ResetFiltersButton";
import {ReconstructionTable} from "./ReconstructionTable";
import {AnnotationStatus, statusNameOnly} from "../../models/annotationStatus";
import {UserPermissions} from "../../graphql/user";
import {hasPermission} from "../../models/user";
import {Navigate} from "react-router-dom";
import {ReconstructionUpload} from "../common/ReconstructionUpload";
import {annotatorUploadGate, GateContext, PreReviewRawUploadSourceStatuses, rawUploadAllowed} from "../../models/reconstructionGates";
import {ReconstructionSpace} from "../../models/reconstructionSpace";
import {RawReconstructionDetails} from "./RawReconstructionDetails";
import {usePageSettings} from "../../hooks/usePageSettings";
import {useSettingsMirror} from "../../hooks/useSettingsMirror";
import {useOffsetReset} from "../../hooks/useOffsetReset";
import {ReconstructionsSettings} from "./reconstructionsSettings";
import {isRawUploadPending} from "../../models/rawReconstructionUpload";
import {rawUploadPollInterval, ReconstructionsPollInterval, useRawUploadNotifications} from "./useRawUploadNotifications";

const uploadPendingMessage = "The latest raw reconstruction upload is still in quality control. Another can be uploaded once it finishes.";

const uploadStatusMessage = `Raw reconstruction uploads are available while the reconstruction is ${PreReviewRawUploadSourceStatuses.map(statusNameOnly).join(" or ")}, or in a review where you can upload the specimen-space reconstruction.`;

function noReconstructionsText(userOnly: boolean, haveFilters: boolean) {
    return userOnly || haveFilters ? "There are no reconstructions that match the filters" : "There are no reconstructions";
}

export const Reconstructions = observer(() => {
    const user = useUser();

    if (!user || !hasPermission(user.permissions, UserPermissions.AnnotateAll)) {
        return <Navigate to="/" replace/>;
    }

    const [settings, update] = usePageSettings(ReconstructionsSettings);

    const {offset, limit} = settings.pagination;

    const userOnly = settings.filters.myReconstructionsOnly;

    const selection = settings.selectedId;

    const [specimenFilter] = useState(() => OptionalFilter.fromSettings(settings.filters.specimens));
    const [statusFilter] = useState(() => OptionalFilter.fromSettings(settings.filters.statuses));

    useSettingsMirror(() => ({specimens: specimenFilter.settings, statuses: statusFilter.settings}),
        mirrored => update(s => ({...s, filters: {...s.filters, ...mirrored}})));

    const setOffset = (offset: number) => update(s => ({...s, pagination: {...s.pagination, offset}}));

    const setLimit = (limit: number) => update(s => ({...s, pagination: {...s.pagination, limit}}));

    const [isCompleteDialogVisible, setIsCompleteDialogVisible] = useState(false);

    const [reviewRequestId, setReviewRequestId] = useState("");
    const [reviewRequestStatus, setReviewRequestStatus] = useState<AnnotationStatus | null>(null);

    const status: number[] = statusFilter.isEnabled ? statusFilter.contents : []

    const sampleIds = specimenFilter.isEnabled ? specimenFilter.contents : [];

    const [pollInterval, setPollInterval] = useState(ReconstructionsPollInterval);

    const {data, error, previousData} = useQuery<AnnotationsResponse, AnnotationQueryArgs>(ANNOTATIONS_QUERY, {
        variables: {queryArgs: {offset: offset, limit: limit, userOnly: userOnly, status: status, specimenIds: sampleIds}, includeRaw: true},
        pollInterval
    });

    useOffsetReset(offset, data?.annotations.total, () => setOffset(0));

    const nextPollInterval = rawUploadPollInterval((data ?? previousData)?.annotations.annotations);

    useEffect(() => setPollInterval(nextPollInterval), [nextPollInterval]);

    const trackRawUpload = useRawUploadNotifications(data?.annotations.annotations);

    if (error) {
        return <GraphQLErrorAlert title="Candidate Data Could Not Be Loaded" error={error}/>;
    }

    let reconstructionCache: Annotation[];
    let totalCount: number;

    if (data?.annotations.annotations) {
        reconstructionCache = data.annotations.annotations;
        totalCount = data.annotations.total;
    } else {
        if (previousData) {
            reconstructionCache = previousData.annotations.annotations;
            totalCount = previousData.annotations.total;
        } else {
            return <Center><Loader type="dots"/></Center>;
        }
    }

    const onUserOnlyChange = (userOnly: boolean) => {
        update(s => ({...s, filters: {...s.filters, myReconstructionsOnly: userOnly}}));
    }

    const onSelected = (reconstruction: Annotation) => {
        if ((reconstruction?.id ?? null) != selection) {
            update(s => ({...s, selectedId: reconstruction?.id ?? null}));
        }
    }

    const resetFilters = () => {
        specimenFilter.apply(ReconstructionsSettings.defaults.filters.specimens);
        statusFilter.apply(ReconstructionsSettings.defaults.filters.statuses);
        update(s => ({...s, filters: {...s.filters, myReconstructionsOnly: ReconstructionsSettings.defaults.filters.myReconstructionsOnly}, pagination: {...s.pagination, offset: 0}}));
    }

    let selectedReconstruction = null;

    reconstructionCache.map(r => {
        if (r.id == selection) {
            selectedReconstruction = r;
        }
    });

    const hasPendingRawUpload = isRawUploadPending(selectedReconstruction?.latestRawReconstructionUpload);

    const uploadContext: GateContext = selectedReconstruction ? {
        area: "annotator",
        status: selectedReconstruction.status,
        childStatus: selectedReconstruction.atlasReconstruction?.status,
        permissions: user.permissions,
        annotatorId: selectedReconstruction.annotatorId,
        userId: user.id,
        hasPendingRawUpload
    } : null;

    const uploadGate = uploadContext ? annotatorUploadGate(uploadContext) : null;

    // The pending reason shows only when the status allows uploads, since it lifts on its own.
    const uploadUnavailableMessage = hasPendingRawUpload && uploadContext && rawUploadAllowed(uploadContext) ? uploadPendingMessage : uploadStatusMessage;

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
                    <Group p={12} justify="space-between">
                        <Text size="lg" fw={500}>Reconstructions</Text>
                        <ResetFiltersButton onReset={resetFilters}/>
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
                                           showRequestReviewDialog={(id: string, status: AnnotationStatus) => {
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
                {uploadGate?.visible ?
                    <Card.Section bg="segment">
                        <Divider orientation="horizontal"/>
                        <ReconstructionUpload key={selectedReconstruction.id} reconstruction={selectedReconstruction} space={ReconstructionSpace.Specimen} raw
                                              disabled={!uploadGate.enabled} disabledMessage={uploadUnavailableMessage} onRawUploadSubmitted={trackRawUpload}
                                              details={<RawReconstructionDetails reconstruction={selectedReconstruction}/>}/>
                    </Card.Section> : null}
            </Card>
        </Stack>
    );
});

