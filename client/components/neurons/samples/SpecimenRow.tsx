import * as React from "react";
import {useMutation} from "@apollo/client";
import {Badge, Button, List, Table} from "@mantine/core";
import {DatePickerInput} from "@mantine/dates";
import {IconCalendar, IconTrash} from "@tabler/icons-react";
import dayjs from "dayjs";

import {SpecimenShape} from "../../../models/specimen";
import {InputPopup} from "../../common/InputPopup";
import {displayInjection, InjectionShape} from "../../../models/injection";
import {CollectionSelect} from "../../common/CollectionSelect";
import {GenotypeAutosuggest} from "../../common/GenotypeAutosuggset";
import {UPDATE_SPECIMEN_MUTATION, UpdateSpecimenMutationResponse, UpdateSpecimenVariables} from "../../../graphql/specimen";
import {toastUpdateError} from "../../common/NotificationHelper";

export type SpecimenRowProps = {
    specimen: SpecimenShape;

    manageInjections(specimen: SpecimenShape): void;
    requestDelete(specimen: SpecimenShape): void;
}

export const SpecimenRow = ({specimen, manageInjections, requestDelete}: SpecimenRowProps) => {
    const [updateSpecimen] = useMutation<UpdateSpecimenMutationResponse, UpdateSpecimenVariables>(UPDATE_SPECIMEN_MUTATION,
        {
            onError: (error) => toastUpdateError(error)
        });

    const updateLabel = async (value: string) => {
        if (value !== specimen.label) {
            await updateSpecimen({variables: {specimen: {id: specimen.id, label: value}}});
        }
    }

    const updateDate = async (s: string) => {
        const value = dayjs(s).toDate();
        if (value !== specimen.referenceDate) {
            await updateSpecimen({variables: {specimen: {id: specimen.id, referenceDate: value ? value.valueOf() : null}}});
        }
    }

    const updateNotes = async (value: string) => {
        if (value !== specimen.notes) {
            await updateSpecimen({variables: {specimen: {id: specimen.id, notes: value}}});
        }
    }

    const updateGenotype = async (name: string) => {
        if ((!specimen.genotype || name !== specimen.genotype.name) || (!name && specimen.genotype)) {
            await updateSpecimen({variables: {specimen: {id: specimen.id, genotypeName: name || null}}});
        }
    }

    const updateCollection = async (collectionId: string) => {
        if (collectionId !== specimen.collectionId) {
            await updateSpecimen({variables: {specimen: {id: specimen.id, collectionId: collectionId}}});
        }
    }

    return (
        <Table.Tr>
            <Table.Td>
                <InputPopup value={specimen.label} label="Specimen Id" placeholder="Enter specimen id..." onAccept={updateLabel}/>
            </Table.Td>
            <Table.Td>
                <DatePickerInput size="sm" leftSection={<IconCalendar size={18} stroke={1.5}/>} clearable placeholder="Select date" valueFormat="YYYY-MM-DD"
                                 value={specimen.referenceDate} type="default" onChange={updateDate}/>
            </Table.Td>
            <Table.Td>
                <InputPopup value={specimen.notes} label="Notes" placeholder="Enter notes..." onAccept={updateNotes}/>
            </Table.Td>
            <Table.Td>
                <GenotypeAutosuggest value={specimen.genotype ? specimen.genotype.name : ""} onChange={updateGenotype}/>
            </Table.Td>
            <Table.Td>
                <a onClick={() => manageInjections(specimen)}>
                    <InjectionList injections={specimen.injections} isExpanded={true}/>
                </a>
            </Table.Td>
            <Table.Td>
                <CollectionSelect value={specimen.collectionId} onChange={updateCollection}/>
            </Table.Td>
            <Table.Td>
                {specimen.neuronCount === 0 ?
                    <Button leftSection={<IconTrash size={18}/>} variant="light" color="red" children="remove" size="sm"
                            onClick={() => requestDelete(specimen)}/> :
                    <Badge p={8} variant="light">{specimen.neuronCount} {specimen.neuronCount == 1 ? "neuron" : "neurons"}</Badge>}
            </Table.Td>
        </Table.Tr>
    )
}


const InjectionList = ({injections, isExpanded}: { injections: InjectionShape[], isExpanded: boolean }) => {
    if (!injections || injections.length === 0) {
        return "(none)";
    }

    if (injections.length === 1) {
        return displayInjection(injections[0]);
    }

    if (!isExpanded) {
        return `${injections.length} injections`;
    }

    const rows = injections.map(i => (
        <List.Item key={`sil_${i.id}`}>
            {displayInjection(i)}
        </List.Item>)
    );

    return <List size="sm">{rows}</List>;
}
