import * as React from "react";
import {Button, Dropdown, Label, Table} from "semantic-ui-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {ISample} from "../../models/sample";
import {InputPopup} from "../editors/InputPopup";
import {AutoSuggestPopup} from "../editors/AutoSuggestPopup";
import {IMouseStrain} from "../../models/mouseStrain";
import {IInjection} from "../../models/injection";
import {TextAreaPopup} from "../editors/TextAreaPopup";
import {ICollection} from "../../models/collection";

export type SampleRowProps = {
    sample: ISample;
    collections: ICollection[];
    mouseStrains: IMouseStrain[];

    updateFcn(sample: ISample): void;
    onRequestManageInjections(sample: ISample): void;
    setSampleForDelete(sample: ISample): void;
    renderInjections(injections: IInjection[], isExpanded: boolean): string | React.JSX.Element;
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
            await updateFn({id: sample.id, sampleDate: value ? value.valueOf() : null});
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

    const onAcceptCollectionEdit = async (sample: ISample, collectionId: string, updateFn: any) => {
        if (collectionId !== sample.collectionId) {
            await updateFn({id: sample.id, collectionId: collectionId});
        }
    }

    const onAcceptTomographyEdit = async (sample: ISample, value: string, updateFn: any) => {
        if (value !== sample.tag) {
            await updateFn({id: sample.id, tomography: value});
        }
    }

    const collections = props.collections.map(s => {
        return {value: s.id, text: s.name}
    });

    return (
        <Table.Row>
            <Table.Cell>
                <InputPopup value={sample.animalId} placeholder="Enter animal id..."
                            onAccept={(value) => onAcceptAnimalIdEdit(sample, value, props.updateFcn)}/>
            </Table.Cell>
            <Table.Cell>
                <DatePicker showIcon toggleCalendarOnIconClick placeholderText="Select sample date" dateFormat="YYYY-MM-DD"
                    selected={sample.sampleDate ? new Date(sample.sampleDate) : null}
                    onChange={(d: Date) => onSampleDateEdit(sample, d, props.updateFcn)}/>
            </Table.Cell>
            <Table.Cell>
                <InputPopup value={sample.tag} placeholder="Enter new tag..."
                            onAccept={(value: string) => onAcceptTagEdit(sample, value, props.updateFcn)}/>
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
                <Dropdown fluid selection options={collections} className="label"
                          value={sample.collectionId}
                          onChange={(_, {value}) => onAcceptCollectionEdit(sample, value as string, props.updateFcn)}
                          style={{fontWeight: "normal"}}/>
            </Table.Cell>
            <Table.Cell>
                <TextAreaPopup value={sample.tomography} limit={30} placeholder="Update tomography..."
                               onAccept={(value) => onAcceptTomographyEdit(sample, value, props.updateFcn)}/>
            </Table.Cell>
            <Table.Cell>
                {sample.neuronCount === 0 ?
                    <Button icon="trash" color="red" size="mini" content="remove" labelPosition="left"
                            onClick={() => props.setSampleForDelete(sample)}/> :
                    <Label>{sample.neuronCount}<Label.Detail>{sample.neuronCount == 1 ? "neuron" : "neurons"}</Label.Detail></Label>}
            </Table.Cell>
        </Table.Row>
    )
}
