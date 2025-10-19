import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Stack, Text, Table} from "@mantine/core";
import {IconTrash} from "@tabler/icons-react";

import {useConstants} from "../../../../hooks/useConstants";
import {
    toastCreateError,
    toastDeleteError,
    toastDeleteSuccess,
    toastUpdateError, toastUpdateSuccess
} from "../../../common/NotificationHelper";
import {SpecimenShape} from "../../../../models/specimen";
import {InjectionShape} from "../../../../models/injection";
import {AtlasStructureShape} from "../../../../models/atlasStructure";
import {FluorophoreShape} from "../../../../models/fluorophore";
import {InjectionVirusShape} from "../../../../models/injectionVirus";
import {
    DELETE_INJECTION_MUTATION,
    DeleteInjectionMutationResponse, DeleteInjectionVariables, INJECTIONS_FOR_SPECIMEN_QUERY,
    UPDATE_INJECTION_MUTATION,
    UpdateInjectionMutationResponse, UpdateInjectionVariables
} from "../../../../graphql/injection";
import {AtlasStructureSelect} from "../../../common/AtlasStructureSelect";
import {Autosuggest} from "../../../common/Autosuggest";
import {MessageBox} from "../../../common/MessageBox";
import {SPECIMENS_QUERY} from "../../../../graphql/specimen";

interface IEditInjectionsPanelProps {
    sample: SpecimenShape;
    injections: InjectionShape[];
    injectionViruses: InjectionVirusShape[];
    fluorophores: FluorophoreShape[];

    refetch(): void;

    onSelectAddTab(): void;
}

export const EditInjectionsPanel = (props: IEditInjectionsPanelProps) => {
    const [state, setState] = useState({
        isDeleteConfirmationShowing: false,
        injectionToDelete: null
    });

    const constants = useConstants().AtlasConstants;

    const [updateInjection] = useMutation<UpdateInjectionMutationResponse, UpdateInjectionVariables>(UPDATE_INJECTION_MUTATION,
        {
            onCompleted: (updateData) => onInjectionUpdated(updateData.updateInjection),
            onError: (error) => toastUpdateError(error)
        });

    const [deleteInjection] = useMutation<DeleteInjectionMutationResponse, DeleteInjectionVariables>(DELETE_INJECTION_MUTATION,
        {
            refetchQueries: [SPECIMENS_QUERY, {query: INJECTIONS_FOR_SPECIMEN_QUERY, variables: {input: {specimenIds: [props.sample.id]}}}],
            onCompleted: (deleteData) => onInjectionDelete(deleteData.deleteInjection),
            onError: (error) => onInjectionDeleteError(error)
        });

    const onShowDeleteConfirmation = (injectionToDelete: InjectionShape) => {
        setState({...state, isDeleteConfirmationShowing: true, injectionToDelete});
    }

    const onClearDeleteConfirmation = () => {
        setState({...state, isDeleteConfirmationShowing: false, injectionToDelete: null});
    }

    const onInjectionUpdated = (injection: InjectionShape) => {
        if (!injection) {
            toastCreateError("The injection label was not updated.");
        } else {
            props.refetch();
            toastUpdateSuccess("The injection label was updated.");
        }
    }

    const onInjectionDelete = (data: string) => {
        onClearDeleteConfirmation();

        if (!data) {
            toastDeleteError("The injection label was not deleted.");
        } else {
            props.refetch();
            toastDeleteSuccess("The injection label was deleted.");
        }
    }

    const onInjectionDeleteError = (error: Error) => {
        toastDeleteError(error);
        onClearDeleteConfirmation();
    };

    const renderModalAlert = () => {
        if (!state.injectionToDelete) {
            return null;
        }

        return (
            <MessageBox opened={state.isDeleteConfirmationShowing} centered={true} title="Delete Injection Label"
                        message={`Are you sure you want to delete the injection label for ${state.injectionToDelete.atlasStructure.name}?  This action can not be undone.`}
                        confirmText="Delete"
                        onCancel={onClearDeleteConfirmation}
                        onConfirm={async () => {
                            await deleteInjection({variables: {id: state.injectionToDelete.id}});
                        }}/>
        );
    }

    const renderInjections = (injections: InjectionShape[]) => {
        const rows = injections.map(t => (
                <Table.Tr key={t.id}>
                    <Table.Td>
                        <AtlasStructureSelect value={constants.findStructure(t.atlasStructure.id)}
                                              onChange={(structure) => onAcceptAtlasStructure(t, structure, updateInjection)}/>
                    </Table.Td>
                    <Table.Td>
                        <Autosuggest w={200} placeholder="select or name a new virus" data={props.injectionViruses} value={t.injectionVirus.name}
                                     onChange={(v: string) => onVirusChanged(t, v, updateInjection)}/>
                    </Table.Td>
                    <Table.Td>
                        <Autosuggest w={200} placeholder="select or name a new fluorophore" data={props.fluorophores} value={t.fluorophore.name}
                                     onChange={(v: string) => onFluorophoreChanged(t, v, updateInjection)}/>
                    </Table.Td>
                    <Table.Td>
                        <Button variant="light" size="xs" color="red" leftSection={<IconTrash size={12}/>}
                                onClick={() => onShowDeleteConfirmation(t)}>Delete</Button>
                    </Table.Td>
                </Table.Tr>
            )
        );

        return (
            <div>
                <Stack>
                    <Text fw={500}>Modify and Delete Labels</Text>
                    <Text size="xs">
                        Modifying an label should only be done to correct errors. You can <a onClick={() => props.onSelectAddTab()}>add a new label</a> if there
                        are multiple labels for the sample.
                    </Text>
                    <Table withTableBorder>
                        <Table.Thead bg="table-header">
                            <Table.Tr>
                                <Table.Th style={{minWidth: "240px"}}>Location</Table.Th>
                                <Table.Th>Virus</Table.Th>
                                <Table.Th>Fluorophore</Table.Th>
                                <Table.Th/>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody bg="table">
                            {rows}
                        </Table.Tbody>
                    </Table>
                </Stack>
                {renderModalAlert()}
            </div>
        );
    }

    const renderNoInjections = () => {
        return (
            <Stack>
                <Text fw={500}>Edit and Remove Labels</Text>
                <Text c="dimmed">There are no labels for this specimen. You can <a onClick={() => props.onSelectAddTab()}> Add new labels here</a> </Text>
            </Stack>
        );
    }

    const injections = props.injections;

    return injections.length > 0 ? renderInjections(injections) : renderNoInjections();
}


async function onAcceptAtlasStructure(injection: InjectionShape, structure: AtlasStructureShape, updateFn: any) {
    let structureId: string = undefined;

    if (structure) {
        if (!injection.atlasStructure || injection.atlasStructure.id !== structure.id) {
            structureId = structure.id;
        }
    } else if (injection.atlasStructure) {
        structureId = null;
    }

    if (structureId !== undefined) {
        await updateFn({variables: {injectionInput: {id: injection.id, atlasStructureId: structureId}}});
    }
}

async function onFluorophoreChanged(injection: InjectionShape, value: string, updateFn: any) {
    if (value !== injection.fluorophore.name) {
        await updateFn({variables: {injectionInput: {id: injection.id, fluorophoreName: value}}});
    }
}

async function onVirusChanged(injection: InjectionShape, value: string, updateFn: any) {
    if (value !== injection.injectionVirus.name) {
        await updateFn({variables: {injectionInput: {id: injection.id, injectionVirusName: value}}});
    }
}
