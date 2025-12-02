import * as React from "react";
import {useState} from "react";
import {useMutation, useQuery} from "@apollo/client";
import {Button, Card, Center, Divider, Group, Loader, SimpleGrid, Table, Text} from "@mantine/core";
import {IconPlus} from "@tabler/icons-react";

import {usePreferences} from "../../hooks/usePreferences";
import {SpecimenShape} from "../../models/specimen";
import {SpecimenRow} from "./SpecimenRow";
import {
    SPECIMEN_SAMPLE_MUTATION,
    CreateSampleMutationResponse,
    CreateSpecimenVariables,
    DELETE_SPECIMEN_MUTATION, DeleteSpecimenMutationResponse, DeleteSpecimenVariables, SpecimensQueryResponse, SPECIMENS_QUERY
} from "../../graphql/specimen";
import {toastCreateError, toastDeleteError} from "../common/NotificationHelper";
import {InjectionsModal} from "./injections/InjectionsModal";
import {PaginationHeader} from "../common/PaginationHeader";
import {MessageBox} from "../common/MessageBox";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";
import {CollectionSelect} from "../common/CollectionSelect";
import {COLLECTIONS_QUERY, CollectionsResponse} from "../../graphql/collection";

type SpecimensTableState = {
    offset?: number;
    limit?: number;
    requestedSampleForDelete?: SpecimenShape;
    isInjectionDialogShown?: boolean;
    manageInjectionsSample?: SpecimenShape;
}

export const SpecimensTable = () => {
    const preferences = usePreferences();

    const [collectionId, setCollectionId] = useState<string>(null);

    const [state, setState] = useState<SpecimensTableState>({
        offset: preferences.samplePageOffset,
        limit: preferences.samplePageLimit,
        requestedSampleForDelete: null,
        isInjectionDialogShown: false,
        manageInjectionsSample: null
    });


    const {data: collectionsData} = useQuery<CollectionsResponse>(COLLECTIONS_QUERY, {fetchPolicy: "cache-first"});

    const {loading, error, data, previousData} = useQuery<SpecimensQueryResponse>(SPECIMENS_QUERY, {fetchPolicy: "cache-first"});

    const [createSample, {loading: createLoading}] = useMutation<CreateSampleMutationResponse, CreateSpecimenVariables>(SPECIMEN_SAMPLE_MUTATION,
        {
            refetchQueries: [SPECIMENS_QUERY],
            onError: (error) => toastCreateError(error)
        });

    const [deleteSample] = useMutation<DeleteSpecimenMutationResponse, DeleteSpecimenVariables>(DELETE_SPECIMEN_MUTATION,
        {
            refetchQueries: [SPECIMENS_QUERY],
            onError: (error) => toastDeleteError(error)
        });


    if (error) {
        return <GraphQLErrorAlert title="Specimen Data Could Not Be Loaded" error={error}/>;
    }

    let specimens: SpecimenShape[];
    let totalCount: number;

    if (!loading) {
        specimens = data.specimens.items;
        totalCount = data.specimens.totalCount;
    } else {
        if (!previousData) {
            return <Center><Loader type="dots"/></Center>;
        }

        specimens = previousData.specimens.items;
        totalCount = previousData.specimens.totalCount;
    }

    let selectedCollectionId = collectionId;

    if (collectionId == null && collectionsData?.collections?.length > 0) {
        selectedCollectionId = collectionsData.collections[0].id;
    }

    const onUpdateOffsetForPage = (page: number) => {
        const offset = state.limit * (page - 1);

        if (offset !== state.offset) {
            setState({...state, offset});

            preferences.samplePageOffset = offset;
        }
    }

    const onUpdateLimit = (limit: number) => {
        if (limit !== state.limit) {
            let offset = state.offset;

            if (offset < limit) {
                offset = 0;
            }

            setState({...state, offset, limit});

            preferences.samplePageOffset = offset;
            preferences.samplePageLimit = limit;
        }
    }

    const onCreateSpecimen = async () => {
        await createSample({variables: {specimen: {collectionId: selectedCollectionId}}})
    }

    const onRequestManageInjections = (forSample: SpecimenShape) => {
        setState({
            ...state,
            isInjectionDialogShown: true,
            manageInjectionsSample: forSample
        });
    }

    const renderInjectionsDialog = () => {
        if (state.manageInjectionsSample && state.isInjectionDialogShown) {
            return (
                <InjectionsModal sample={state.manageInjectionsSample}
                                 show={state.isInjectionDialogShown}
                                 onClose={() => setState({...state, isInjectionDialogShown: false})}/>
            );
        } else {
            return null;
        }
    }

    const renderDeleteConfirmationModal = () => {
        if (!state.requestedSampleForDelete) {
            return null;
        }

        return <MessageBox opened={true} centered={true}
                           title="Delete Speciman?"
                           message={`Are you sure you want to delete specimen ${state.requestedSampleForDelete.label}?  This action can not be undone.`}
                           confirmText="Delete"
                           onCancel={() => setState({...state, requestedSampleForDelete: null})}
                           onConfirm={async () => {
                               await deleteSample({variables: {id: state.requestedSampleForDelete.id}});
                               setState({...state, requestedSampleForDelete: null});
                           }}/>
    }

    const setSampleForDelete = (sample: SpecimenShape) => {
        setState({...state, requestedSampleForDelete: sample})
    };

    const samples = specimens.slice(state.offset, state.offset + state.limit);

    const pageCount = Math.ceil(totalCount / state.limit);

    const activePage = (state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1);

    const start = state.offset + 1;

    const end = Math.min(state.offset + state.limit, totalCount);

    const rows = samples.map(s => {
        return <SpecimenRow key={s.id} specimen={s} requestDelete={setSampleForDelete} manageInjections={onRequestManageInjections}/>
    });

    const table = (
        <Table>
            <Table.Thead bg="table-header">
                <Table.Tr>
                    <Table.Th>Id</Table.Th>
                    <Table.Th>Acq. Date</Table.Th>
                    <Table.Th>Notes</Table.Th>
                    <Table.Th>Genotype</Table.Th>
                    <Table.Th>Labeling</Table.Th>
                    <Table.Th>Collection</Table.Th>
                    <Table.Th>Soma Features</Table.Th>
                    <Table.Th/>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody bg="table">
                {rows}
            </Table.Tbody>
        </Table>
    );

    return (
        <div>
            {renderInjectionsDialog()}
            {renderDeleteConfirmationModal()}
            <Card withBorder>
                <Card.Section bg="segment">
                    <Group justify="space-between" p={12}>
                        <Text size="lg" fw={500}>Specimens</Text>
                        <Group>
                            <CollectionSelect value={selectedCollectionId} onChange={setCollectionId}/>
                            <Button loading={createLoading} leftSection={<IconPlus size={18}/>} disabled={!selectedCollectionId}
                                    onClick={() => onCreateSpecimen()}>Add</Button>
                        </Group>
                    </Group>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section bg="table-header">
                    <PaginationHeader total={pageCount} value={activePage} limit={state.limit} itemCount={totalCount}
                                      onLimitChange={limit => onUpdateLimit(limit)}
                                      onChange={page => onUpdateOffsetForPage(page)}/>
                </Card.Section>
                <Card.Section>
                    <Divider orientation="horizontal"/>
                    {samples.length == 0 ? <Center><Text c="dimmed" p={24}>There are no specimens.</Text></Center> : table}
                </Card.Section>
                {samples.length > 0 ?
                    <Card.Section bg="segment">
                        <Divider orientation="horizontal"/>
                        <SimpleGrid cols={3} p={8}>
                            <Text
                                size="sm">{totalCount >= 0 ? (totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} specimens` : "There are no specimens") : ""}</Text>
                            <Text size="sm" ta="center" c="dimmed">Click a cell value to modify a value</Text>
                            <Text size="sm" ta="end">{`Page ${activePage} of ${pageCount}`}</Text>
                        </SimpleGrid>
                    </Card.Section> : null}
            </Card>
        </div>
    )
}
