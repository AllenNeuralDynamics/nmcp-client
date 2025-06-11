import * as React from "react";
import {useContext} from "react";
import {useMutation} from "@apollo/client";
import {Table, Button, Dropdown, Label} from "semantic-ui-react";
import {toast} from "react-toastify";

import {ConstantsContext} from "../app/AppConstants";
import {ConsensusStatus, ConsensusStatusOptions, FindConsensusStatusOption} from "../../models/consensusStatus";
import {formatHortaLocation, formatSomaLocation, INeuron, parseSomaLocation} from "../../models/neuron";
import {displaySample} from "../../models/sample";
import {IBrainArea} from "../../models/brainArea";
import {toastCreateError, toastUpdateError} from "../editors/Toasts";
import {BrainAreaDropdown} from "../editors/BrainAreaDropdown";
import {UPDATE_NEURON_MUTATION, UpdateNeuronMutationData, UpdateNeuronMutationResponse, UpdateNeuronVariables} from "../../graphql/neuron";
import {InputPopup} from "../editors/InputPopup";

interface INeuronRowProps {
    neuron: INeuron;

    onDeleteNeuron(neuron: INeuron): void;

    onManageNeuronAnnotations(neuron: INeuron): void;
}

export const NeuronRow = (props: INeuronRowProps) => {
    const constants = useContext(ConstantsContext);

    const onAcceptTagEdit = async (value: string, updateFn: any) => {
        if (value !== props.neuron.tag) {
            await updateFn({variables: {neuron: {id: props.neuron.id, tag: value}}});
        }
    }

    const onAcceptIdStringEdit = async (value: string, updateFn: any) => {
        if (value !== props.neuron.idString) {
            await updateFn({variables: {neuron: {id: props.neuron.id, idString: value}}});
        }
    }

    const onAcceptConsensusStatus = async (value: ConsensusStatus, updateFn: any) => {
        if (value !== props.neuron.consensus) {
            await updateFn({variables: {neuron: {id: props.neuron.id, consensus: value}}});
        }
    }

    const onAcceptSomaLocationEdit = async (value: string, updateFn: any) => {
        const result = parseSomaLocation(value);

        if (result.error) {
            return;
        }

        await updateFn({variables: {neuron: {id: props.neuron.id, x: result.x, y: result.y, z: result.z}}});
    }

    const onAcceptHortaLocationEdit = async (value: string, updateFn: any) => {
        const result = parseSomaLocation(value);

        if (result.error) {
            return;
        }

        await updateFn({variables: {neuron: {id: props.neuron.id, sampleX: result.x, sampleY: result.y, sampleZ: result.z}}});
    }

    const onBrainAreaChange = async (brainArea: IBrainArea, updateFn: any) => {
        if (brainArea) {
            if (!props.neuron.brainArea || brainArea.id !== props.neuron.brainArea.id) {
                await updateFn({variables: {neuron: {id: props.neuron.id, brainStructureId: brainArea.id}}});
            }
        } else {
            if (props.neuron.brainArea) {
                await updateFn({variables: {neuron: {id: props.neuron.id, brainStructureId: null}}});
            }
        }
    }

    const n = props.neuron;

    if (!n) {
        return null;
    }

    const count = props.neuron.reconstructions.length;

    const [updateNeuron] = useMutation<UpdateNeuronMutationResponse, UpdateNeuronVariables>(UPDATE_NEURON_MUTATION,
        {
            onCompleted: (data) => onNeuronUpdated(data.updateNeuron),
            onError: (error) => toast.error(toastUpdateError(error), {autoClose: false})
        });

    return (
        <Table.Row>
            <Table.Cell style={{minWidth: "60px", maxWidth: "60px"}}>
                <InputPopup value={n.idString} placeholder="(none)"
                            onAccept={v => onAcceptIdStringEdit(v, updateNeuron)}/>
            </Table.Cell>
            <Table.Cell style={{maxWidth: "100px"}}>
                {displaySample(n.sample)}
            </Table.Cell>
            <Table.Cell style={{minWidth: "60px", maxWidth: "60px"}}>
                <InputPopup value={n.tag} placeholder="(none)"
                            onAccept={v => onAcceptTagEdit(v, updateNeuron)}/>
            </Table.Cell>
            <Table.Cell>
                <BrainAreaDropdown brainArea={n.brainArea ? constants.findBrainArea(n.brainArea.id) : null}
                                   onBrainAreaChange={(brainArea: IBrainArea) => onBrainAreaChange(brainArea, updateNeuron)}/>

            </Table.Cell>
            <Table.Cell style={{maxWidth: "140px"}}>
                <InputPopup value={formatSomaLocation(n)} placeholder="(undefined)"
                            onAccept={v => onAcceptSomaLocationEdit(v, updateNeuron)}
                            isValidValueFcn={v => !parseSomaLocation(v).error}/>
            </Table.Cell>
            <Table.Cell style={{maxWidth: "140px"}}>
                <InputPopup value={formatHortaLocation(n)} placeholder="(undefined)"
                            onAccept={v => onAcceptHortaLocationEdit(v, updateNeuron)}
                            isValidValueFcn={v => !parseSomaLocation(v).error}/>
            </Table.Cell>
            <Table.Cell style={{width: "110px"}}>
                <Dropdown search fluid inline options={ConsensusStatusOptions}
                          value={FindConsensusStatusOption(n.consensus).value}
                          onChange={(_, {value}) => onAcceptConsensusStatus(value as ConsensusStatus, updateNeuron)}/>
            </Table.Cell>
            <Table.Cell style={{maxWidth: "120px"}}>
                {n.doi || "(none)"}
            </Table.Cell>
            <Table.Cell style={{width: "150px"}}>
                {count !== undefined ? (count == 0 ?
                    <Button icon="trash" color="red" size="mini" content="remove" labelPosition="left" onClick={() => props.onDeleteNeuron(n)}/>
                    : <Label>{count}<Label.Detail>{count == 1 ? "reconstruction" : "reconstructions"}</Label.Detail></Label>) : "?"}
            </Table.Cell>
        </Table.Row>
    );
}

function onNeuronUpdated(data: UpdateNeuronMutationData) {
    if (!data.source || data.error) {
        toast.error(toastCreateError(data.error), {autoClose: false});
    }
}
