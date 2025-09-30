import * as React from "react";
import {useContext, useState} from "react";
import {useMutation} from "@apollo/client";
import {Button, Confirm, Header, Table} from "semantic-ui-react";
import {toast} from "react-toastify";

import {FluorophoreAutoSuggest} from "../../../common/FluorophoreAutoSuggest";
import {BrainAreaDropdown} from "../../../common/BrainAreaDropdown";
import {
    toastCreateError,
    toastDeleteError,
    toastDeleteSuccess,
    toastUpdateError
} from "../../../common/Toasts";

import {ISample} from "../../../../models/sample";
import {IInjection} from "../../../../models/injection";
import {IBrainArea} from "../../../../models/brainArea";
import {VirusAutoSuggest} from "../../../common/VirusAutoSuggest";
import {IFluorophore} from "../../../../models/fluorophore";
import {IInjectionVirus} from "../../../../models/injectionVirus";
import {
    DELETE_INJECTION_MUTATION,
    DeleteInjectionMutationData, DeleteInjectionMutationResponse, DeleteInjectionVariables,
    UPDATE_INJECTION_MUTATION,
    UpdateInjectionMutationData,
    UpdateInjectionMutationResponse, UpdateInjectionVariables
} from "../../../../graphql/injection";
import {ConstantsContext} from "../../../app/AppConstants";

function onInjectionUpdated(data: UpdateInjectionMutationData) {
    if (!data.source || data.error) {
        toast.error(toastCreateError(data.error), {autoClose: false});
    }
}

interface IEditInjectionsPanelProps {
    sample: ISample;
    injections: IInjection[];
    injectionViruses: IInjectionVirus[];
    fluorophores: IFluorophore[];

    onSelectAddTab(): void;
}


export const EditInjectionsPanel = (props: IEditInjectionsPanelProps) => {
    const [state, setState] = useState({
        isDeleteConfirmationShowing: false,
        injectionToDelete: null,
        deletedInjections: []
    });

    const constants = useContext(ConstantsContext)

    const [updateInjection] = useMutation<UpdateInjectionMutationResponse, UpdateInjectionVariables>(UPDATE_INJECTION_MUTATION,
        {
            refetchQueries: ["AppQuery"],
            onCompleted: (updateData) => onInjectionUpdated(updateData.updateInjection),
            onError: (error) => toast.error(toastUpdateError(error), {autoClose: false})
        });

    const [deleteInjection] = useMutation<DeleteInjectionMutationResponse, DeleteInjectionVariables>(DELETE_INJECTION_MUTATION,
        {
            refetchQueries: ["AppQuery"],
            onCompleted: (deleteData) => onInjectionDelete(deleteData.deleteInjection),
            onError: (error) => onInjectionDeleteError(error)
        });

    const onShowDeleteConfirmation = (injectionToDelete: IInjection) => {
        setState({...state, isDeleteConfirmationShowing: true, injectionToDelete});
    }

    const onClearDeleteConfirmation = () => {
        setState({...state, isDeleteConfirmationShowing: false, injectionToDelete: null});
    }

    const onInjectionDelete = (data: DeleteInjectionMutationData) => {
        onClearDeleteConfirmation();

        if (!data.id || data.error) {
            toast.error(toastDeleteError(data.error), {autoClose: false});
        } else {
            setState({...state, deletedInjections: state.deletedInjections.concat([data.id])});
            toast.success(toastDeleteSuccess());
        }
    }

    const onInjectionDeleteError = (error: Error) => {
        toast.error(toastDeleteError(error), {autoClose: false});
        onClearDeleteConfirmation();
    };

    const renderModalAlert = () => {
        if (!state.injectionToDelete) {
            return null;
        }

        return (
            <Confirm open={state.isDeleteConfirmationShowing} header="Delete Label" dimmer="blurring"
                     content={`Are you sure you want to delete the label for ${state.injectionToDelete.brainArea.name}?  This action can not be undone.`}
                     confirmButton="Delete" onCancel={() => onClearDeleteConfirmation()}
                     onConfirm={async () => {
                         await deleteInjection({variables: {id: state.injectionToDelete.id}})
                     }}/>
        )
    }

    const renderInjections = (injections: IInjection[]) => {

        const rows = injections.map(t => (
                <Table.Row key={t.id}>
                    <Table.Cell>
                        <BrainAreaDropdown brainArea={constants.findBrainArea(t.brainArea.id)}
                                           onBrainAreaChange={(brainArea: IBrainArea) => onAcceptBrainArea(t, brainArea, updateInjection)}/>
                    </Table.Cell>
                    <Table.Cell>
                        <VirusAutoSuggest items={props.injectionViruses}
                                          placeholder="select or name a new virus"
                                          initialValue={t.injectionVirus.name}
                                          isDeferredEditMode={true}
                                          onChange={(v: string) => onVirusChanged(t, v, updateInjection)}/>
                    </Table.Cell>
                    <Table.Cell>
                        <FluorophoreAutoSuggest items={props.fluorophores}
                                                placeholder="select or name a new fluorophore"
                                                initialValue={t.fluorophore.name}
                                                isDeferredEditMode={true}
                                                onChange={(v: string) => onFluorophoreChanged(t, v, updateInjection)}/>
                    </Table.Cell>
                    <Table.Cell style={{minWidth: "120px"}}>
                        <Button icon="trash" color="red" size="mini" content="delete" labelPosition="left"
                                onClick={() => onShowDeleteConfirmation(t)}/>
                    </Table.Cell>
                </Table.Row>
            )
        );

        return (
            <div>
                <Header>
                    Modify and Delete Labels
                    <Header.Subheader>
                        <p>
                            You may not delete labels that are associated with neurons.
                        </p>
                        <p>
                            Modifying an label should <span style={emp}>only</span> be done to correct errors. You
                            can <span style={emp}><a
                            onClick={() => props.onSelectAddTab()}>add a new label</a></span> if there are
                            multiple labels for the sample.
                        </p>
                    </Header.Subheader>
                </Header>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Location</Table.HeaderCell>
                            <Table.HeaderCell>Virus</Table.HeaderCell>
                            <Table.HeaderCell>Fluorophore</Table.HeaderCell>
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                </Table>
                {renderModalAlert()}
            </div>
        );
    }

    const renderNoInjections = () => {
        return (
            <Header>
                Edit and Remove Labels
                <Header.Subheader>
                    There are no labels for this sample. You can <a
                    onClick={() => props.onSelectAddTab()}> Add new labels here</a>
                </Header.Subheader>
            </Header>
        );
    }

    const injections = props.injections.filter(i => state.deletedInjections.find(id => id === i.id) === undefined);

    return injections.length > 0 ? renderInjections(injections) : renderNoInjections();
}


async function onAcceptBrainArea(injection: IInjection, brainArea: IBrainArea, updateFn: any) {
    let brainAreaId = undefined;

    if (brainArea) {
        if (!injection.brainArea || injection.brainArea.id !== brainArea.id) {
            brainAreaId = brainArea.id;
        }
    } else if (injection.brainArea) {
        brainAreaId = null;
    }

    if (brainAreaId !== undefined) {
        await updateFn({variables: {injectionInput: {id: injection.id, brainAreaId}}});
    }
}

async function onFluorophoreChanged(injection: IInjection, value: string, updateFn: any) {
    if (value !== injection.fluorophore.name) {
        await updateFn({variables: {injectionInput: {id: injection.id, fluorophoreName: value}}});
    }
}

async function onVirusChanged(injection: IInjection, value: string, updateFn: any) {
    if (value !== injection.injectionVirus.name) {
        await updateFn({variables: {injectionInput: {id: injection.id, injectionVirusName: value}}});
    }
}

const emp = {
    fontWeight: "bold" as "bold" | 100,
    textDecoration: "underline"
};
