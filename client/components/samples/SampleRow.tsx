import * as React from "react";
import {Button, Label, Table} from "semantic-ui-react";
import ReactDatePicker from "react-datepicker";
import moment from "moment/moment";

import {ISample} from "../../models/sample";
import {InputPopup} from "../editors/InputPopup";
import {AutoSuggestPopup} from "../editors/AutoSuggestPopup";
import {IMouseStrain} from "../../models/mouseStrain";
import {IInjection} from "../../models/injection";
import {TextAreaPopup} from "../editors/TextAreaPopup";

export type SampleRowProps = {
    sample: ISample;
    mouseStrains: IMouseStrain[];

    updateFcn(sample: ISample): void;
    onRequestManageInjections(sample: ISample): void;
    setSampleForDelete(sample: ISample): void;
    renderInjections(injections: IInjection[], isExpanded: boolean): string | JSX.Element;
}

export const SampleRow = (props: SampleRowProps) => {
    const sample = props.sample;

    const onAcceptIdNumberEdit = async (sample: ISample, value: string, updateFn: any) => {
        const idNumber = parseInt(value);

        if (!isNaN(idNumber) && idNumber !== sample.idNumber) {
            await updateFn({id: sample.id, idNumber});
        }
    }

    const onSampleDateEdit = async (sample: ISample, value: Date, updateFn: any) => {
        if (value !== sample.sampleDate) {
            await updateFn({id: sample.id, sampleDate: value.valueOf()});
        }
    }

    const onAcceptTagEdit = async (sample: ISample, value: string, updateFn: any) => {
        if (value !== sample.tag) {
            await updateFn({id: sample.id, tag: value});
        }
    }

    const onAcceptAnimalIdEdit = async (sample: ISample, value: string, updateFn: any) => {
        if (value !== sample.animalId) {
            await updateFn({id: sample.id, animalId: value});
        }
    }

    const onAcceptMouseStrainChange = async (sample: ISample, name: string, updateFn: any) => {
        if ((!sample.mouseStrain || name !== sample.mouseStrain.name) || (!name && sample.mouseStrain)) {
            await updateFn({id: sample.id, mouseStrainName: name || null});
        }
    }

    const onAcceptTomographyEdit = async (sample: ISample, value: string, updateFn: any) => {
        if (value !== sample.tag) {
            await updateFn({id: sample.id, tomography: value});
        }
    }

    return (
        <Table.Row>
            <Table.Cell>
                <InputPopup value={sample.idNumber.toString()} placeholder="Enter new id..." isValidValueFcn={(val: string) => !isNaN(parseInt(val))}
                            onAccept={(value: string) => onAcceptIdNumberEdit(sample, value, props.updateFcn)}/>
            </Table.Cell>
            <Table.Cell>
                <ReactDatePicker
                    className="date-picker-input"
                    dateFormat="YYYY-MM-DD"
                    selected={moment(new Date(sample.sampleDate))}
                    onChange={(d) => onSampleDateEdit(sample, d.toDate(), props.updateFcn)}/>
            </Table.Cell>
            <Table.Cell>
                <InputPopup value={sample.tag} placeholder="Enter new tag..."
                            onAccept={(value: string) => onAcceptTagEdit(sample, value, props.updateFcn)}/>
            </Table.Cell>
            <Table.Cell>
                <InputPopup value={sample.animalId} placeholder="Enter animal id..."
                            onAccept={(value) => onAcceptAnimalIdEdit(sample, value, props.updateFcn)}/>
            </Table.Cell>
            <Table.Cell>
                <AutoSuggestPopup<IMouseStrain> items={props.mouseStrains} placeholder="select or name a genotype"
                                                value={sample.mouseStrain ? sample.mouseStrain.name : ""}
                                                onChange={(value: string) => onAcceptMouseStrainChange(sample, value, props.updateFcn)}/>
            </Table.Cell>
            <Table.Cell>
                <a onClick={() => props.onRequestManageInjections(sample)}>
                    {props.renderInjections(sample.injections, true)}
                </a>
            </Table.Cell>
            <Table.Cell>
                <TextAreaPopup value={sample.tomography} limit={30} placeholder="Update tomography..."
                               onAccept={(value) => onAcceptTomographyEdit(sample, value, props.updateFcn)}/>
            </Table.Cell>
            <Table.Cell>
                {sample.neuronCount === 0 ?
                    <Button icon="trash" color="red" size="mini" content="none" labelPosition="left"
                            onClick={() => props.setSampleForDelete(sample)}/> :
                    <Label>{sample.neuronCount}<Label.Detail>{sample.neuronCount == 1 ? "neuron" : "neurons"}</Label.Detail></Label>}
            </Table.Cell>
        </Table.Row>
    )
}
