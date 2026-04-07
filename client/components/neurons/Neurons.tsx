import * as React from "react";
import {useEffect, useState} from "react";
import {useMutation, useQuery} from "@apollo/client";
import {observer} from "mobx-react-lite";
import {Button, Card, Center, Divider, Group, Loader, SimpleGrid, Text} from "@mantine/core";
import {IconPencil, IconPlus, IconUpload} from "@tabler/icons-react";

import {toastCreateError, toastDeleteError} from "../common/NotificationHelper";
import {PaginationHeader} from "../common/PaginationHeader";
import {
    CREATE_NEURON_MUTATION,
    CreateNeuronMutationResponse,
    CreateNeuronVariables,
    DELETE_NEURON_MUTATION,
    DeleteNeuronMutationResponse,
    DeleteNeuronVariables,
    NEURONS_QUERY,
    NeuronsQueryResponse,
    NeuronsQueryVariables
} from "../../graphql/neuron";
import {SpecimenShape} from "../../models/specimen";
import {NeuronsTable} from "./NeuronsTable";
import {formatNeuron, NeuronShape, NeuronStatus} from "../../models/neuron";
import {UserPreferences} from "../../util/userPreferences";
import {ImportSomasModal} from "./soma/ImportSomasModal";
import {SpecimenFilter} from "../common/filters/SpecimenFilter";
import {AtlasStructureMultiSelectFilter} from "../common/filters/AtlasStructureMultiSelectFilter";
import {NeuronTagFilter} from "../common/filters/NeuronTagFilter";
import {CandidateFilter, OptionalFilter} from "../../viewmodel/candidateFilter";
import {CandidateMetrics} from "../candidates/CandidateMetrics";
import {SpecimenSelect} from "../common/SpecimenSelect";
import {SPECIMENS_QUERY, SpecimensQueryResponse} from "../../graphql/specimen";
import {GraphQLErrorAlert} from "../common/GraphQLErrorAlert";
import {usePreferences} from "../../hooks/usePreferences";
import {MessageBox} from "../common/MessageBox";
import {BulkUpdateModal} from "./BulkUpdateModal";
import {NeuronStatusFilter} from "../common/filters/NeuronStatusFilter";

interface INeuronsState {
    offset: number;
    limit: number;
    requestedNeuronForDelete: NeuronShape;
    isUploadSomaPropertiesOpen: boolean;
}

export const Neurons = observer(() => {
    const preferences = usePreferences();

    const [sampleId, setSampleId] = useState<string>(null);
    const [isSampleLocked, setIsSampleLocked] = useState<boolean>(false);

    const [candidateFilter] = useState(new CandidateFilter());
    const [statusFilter] = useState(new OptionalFilter<NeuronStatus>(NeuronStatus.Unpublished));
    const [showBulkUpdate, setShowBulkUpdate] = useState(false);

    const [state, setState] = useState<INeuronsState>({
        offset: UserPreferences.Instance.neuronPageOffset,
        limit: UserPreferences.Instance.neuronPageLimit,
        requestedNeuronForDelete: null,
        isUploadSomaPropertiesOpen: false
    });

    const [deleteNeuron] = useMutation<DeleteNeuronMutationResponse, DeleteNeuronVariables>(DELETE_NEURON_MUTATION,
        {
            refetchQueries: [NEURONS_QUERY],
            onError: (error) => toastDeleteError(error)
        });

    const [createNeuron, {loading: isCreating}] = useMutation<CreateNeuronMutationResponse, CreateNeuronVariables>(CREATE_NEURON_MUTATION,
        {
            refetchQueries: [NEURONS_QUERY],
            onCompleted: (data) => onNeuronCreated(data.createNeuron),
            onError: (error) => toastCreateError(error)
        });

    const specimenData = useQuery<SpecimensQueryResponse>(SPECIMENS_QUERY, {fetchPolicy: "cache-first"});

    const {loading, error, data, previousData} = useQuery<NeuronsQueryResponse, NeuronsQueryVariables>(NEURONS_QUERY,
        {
            pollInterval: 10000,
            variables: {
                input: {
                    offset: state.offset,
                    limit: state.limit,
                    specimenIds: candidateFilter.specimenIds,
                    atlasStructureIds: candidateFilter.atlasStructureIds,
                    keywords: candidateFilter.keywords,
                    somaProperties: candidateFilter.somaFilter,
                    status: statusFilter.isEnabled ? statusFilter.contents : undefined
                }
            }
        });

    useEffect(() => {
        if (specimenData.data) {
            let possibleSpecimen = preferences.neuronCreateLockedSampleId;
            let possibleLock = possibleSpecimen != null;

            const s = specimenData.data.specimens.items;

            if (!possibleLock) {
                if (s.length > 0) {
                    possibleSpecimen = s[0].id;
                }
            } else {
                if (!s.find(v => v.id == possibleSpecimen)) {
                    possibleLock = false;
                    if (s.length > 0) {
                        possibleSpecimen = s[0].id;
                    }
                }
            }
            setSampleId(possibleSpecimen);
            setIsSampleLocked(possibleLock);
        } else {
            setSampleId(null);
            setIsSampleLocked(false);
        }
    }, [specimenData.data]);

    if (specimenData.error || error) {
        return <GraphQLErrorAlert title={`${error ? "Neuron" : "Specimen"} Data Could not be Loaded`} error={specimenData.error || error}/>;
    }

    let neurons: NeuronShape[];
    let totalCount: number;

    if (data) {
        neurons = data.neurons.items;

        totalCount = data.neurons.totalCount;
    } else {
        if (loading && !previousData) {
            return <Center><Loader type="dots"/></Center>
        }
        neurons = previousData.neurons.items;
        totalCount = previousData.neurons.totalCount;
    }

    let specimens: SpecimenShape[] = [];

    if (specimenData.data) {
        specimens = specimenData.data.specimens.items;
    } else {
        if (specimenData.previousData) {
            specimens = specimenData.previousData.specimens.items;
        }
    }

    const onUpdateOffsetForPage = (page: number) => {
        const offset = state.limit * (page - 1);

        if (offset !== state.offset) {
            setState({...state, offset});

            UserPreferences.Instance.neuronPageOffset = offset;
        }
    };

    const onUpdateLimit = (limit: number) => {
        if (limit !== state.limit) {
            let offset = state.offset;

            if (offset < limit) {
                offset = 0;
            }

            setState({...state, offset, limit});

            UserPreferences.Instance.neuronPageOffset = offset;
            UserPreferences.Instance.neuronPageLimit = limit;
        }
    };

    const onSampleChange = (sampleId: string) => {
        setSampleId(sampleId);
    }

    const onLockSample = (b: boolean) => {
        setIsSampleLocked(b);
        UserPreferences.Instance.neuronCreateLockedSampleId = b ? sampleId : "";
    }

    const uploadSomaProperties = () => {
        setState({...state, isUploadSomaPropertiesOpen: true});
    }

    const hasNeurons = neurons?.length > 0;

    const renderCreateNeuron = () => {
        return (
            <Group preventGrowOverflow={false}>
                <Group gap={0}>
                    <SpecimenSelect value={sampleId} lockable locked={isSampleLocked} onChange={onSampleChange}
                                    onLock={onLockSample}/>
                </Group>
                    <Button color="green" variant="light" leftSection={<IconUpload size={18}/>} disabled={sampleId == null || isCreating}
                            onClick={() => uploadSomaProperties()}>Import...</Button>
                <Button color="green" variant="light" leftSection={<IconPencil size={18}/>} disabled={!hasNeurons}
                        onClick={() => setShowBulkUpdate(true)}>Update...</Button>
                <Button leftSection={<IconPlus size={18}/>} disabled={sampleId == null || isCreating} loading={isCreating}
                        onClick={() => createNeuron({variables: {neuron: {specimenId: sampleId}}})}>Add</Button>
            </Group>
        );
    }

    const renderDeleteConfirmationModal = () => {
        if (!state.requestedNeuronForDelete) {
            return null;
        }

        return <MessageBox opened={true} centered={true} title="Delete Neuron"
                           message={`Are you sure you want to delete the neuron ${formatNeuron(state.requestedNeuronForDelete)}?  This action can not be undone.`}
                           confirmText="Delete"
                           onCancel={() => setState({...state, requestedNeuronForDelete: null})}
                           onConfirm={async () => {
                               await deleteNeuron({variables: {id: state.requestedNeuronForDelete.id}});
                               setState({...state, requestedNeuronForDelete: null});
                           }}/>
    }

    const renderUploadSomaProperties = () => {
        if (!state.isUploadSomaPropertiesOpen || !sampleId) {
            return null;
        }

        const onClose = () => {
            setState({...state, isUploadSomaPropertiesOpen: false});
        };

        return (
            <ImportSomasModal sample={specimens.find(s => s.id == sampleId)} onClose={onClose}/>
        );
    }

    const pageCount = Math.ceil(totalCount / state.limit);

    const activePage = state.offset ? (Math.floor(state.offset / state.limit) + 1) : 1;

    const start = state.offset + 1;
    const end = Math.min(state.offset + state.limit, totalCount);

    return (
        <div>
            {renderDeleteConfirmationModal()}
            {renderUploadSomaProperties()}
            <BulkUpdateModal open={showBulkUpdate} neuronIds={neurons?.map(n => n.id) ?? []} totalCount={totalCount ?? 0}
                             queryInput={{
                                 specimenIds: candidateFilter.specimenIds,
                                 atlasStructureIds: candidateFilter.atlasStructureIds,
                                 keywords: candidateFilter.keywords,
                                 somaProperties: candidateFilter.somaFilter
                             }}
                             onClose={() => setShowBulkUpdate(false)}/>
            <Card withBorder>
                <Card.Section bg="segment">
                    <Group justify="space-between" p={12}>
                        <Text size="lg" fw={500}>Neurons</Text>
                        {renderCreateNeuron()}
                    </Group>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section bg="segment">
                    <Group p={12} align="center">
                        <SpecimenFilter w={160} filter={candidateFilter.samplesFilter}/>
                        <Divider orientation="vertical"/>
                        <AtlasStructureMultiSelectFilter w={300} filter={candidateFilter.atlasStructureFilter}/>
                        <Divider orientation="vertical"/>
                        <NeuronTagFilter filter={candidateFilter.tagFilter}/>
                        <Divider orientation="vertical"/>
                        <NeuronStatusFilter filter={statusFilter}/>
                    </Group>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section bg="segment">
                    <CandidateMetrics candidateFilter={candidateFilter}/>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section>
                    <PaginationHeader total={pageCount} value={activePage} limit={state.limit} itemCount={totalCount} onLimitChange={onUpdateLimit}
                                      onChange={onUpdateOffsetForPage}/>
                    <Divider orientation="horizontal"/>
                </Card.Section>
                <Card.Section>
                    {neurons.length > 0 ?
                        <NeuronsTable neurons={neurons} pageCount={pageCount} activePage={activePage} start={start} end={end}
                                      totalCount={totalCount} onDeleteNeuron={(n) => setState({...state, requestedNeuronForDelete: n})}/> :
                        <Center><Text c="dimmed" p={24}>{zeroNeuronsMessage(candidateFilter.anyEnabled)}</Text></Center>}
                </Card.Section>
                {neurons.length > 0 ?
                    <Card.Section bg="segment">
                        <Divider orientation="horizontal"/>
                        <SimpleGrid cols={3} p={8}>
                            <Text
                                size="sm">{totalCount >= 0 ? (totalCount > 0 ? `Showing ${start} to ${end} of ${totalCount} neurons` : "There are no neurons") : ""}</Text>
                            <Text size="sm" ta="center" c="dimmed">Click a cell value to modify a value</Text>
                            <Text size="sm" ta="end">{`Page ${activePage} of ${pageCount}`}</Text>
                        </SimpleGrid>
                    </Card.Section> : null}
            </Card>
        </div>
    );
});

function onNeuronCreated(data: NeuronShape) {
    if (!data) {
        toastCreateError("The neuron was not created.");
    }
}

function zeroNeuronsMessage(isFiltered: boolean): string {
    return `There are no neurons${isFiltered ? " that match the current filters" : "."}`;
}
