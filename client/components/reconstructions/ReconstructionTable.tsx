import * as React from "react";
import {Group, Table, Tooltip} from "@mantine/core";
import {IconCopy} from "@tabler/icons-react";

import {Annotation} from "../../models/annotation";
import {formatAtlasStructure} from "../../models/atlasStructure";
import {selectSomaLocation} from "../../models/neuron";
import {formatUser} from "../../models/user";
import {ReconstructionStatusLabel} from "../common/ReconstructionStatus";
import {NeuronVersionLink} from "../common/NeuronVersionLink";
import {SpecimenLink} from "../common/SpecimenLink";
import {successNotification} from "../common/NotificationHelper";

type ReconstructionTableProps = {
    reconstructions: Annotation[];
    selectedId: string;

    onSelected: (reconstruction: Annotation) => void;
}
export const ReconstructionTable = ({reconstructions, selectedId, onSelected}: ReconstructionTableProps) => {
    const rows = reconstructions.map(r => {
        return <ReconstructionRow reconstruction={r} isSelected={r.id == selectedId} onSelected={onSelected}/>
    });

    return (
        <Table withColumnBorders>
            <Table.Thead bg="table-header">
                <Table.Tr>
                    <Table.Th rowSpan={3}>Neuron</Table.Th>
                    <Table.Th rowSpan={3}>Specimen</Table.Th>
                    <Table.Th colSpan={5} ta="center">Specimen-Space</Table.Th>
                    <Table.Th rowSpan={2} colSpan={4} ta="center">Atlas Soma</Table.Th>
                    <Table.Th rowSpan={3}>Annotator</Table.Th>
                    <Table.Th rowSpan={3}>Status</Table.Th>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th colSpan={3} ta="center">Soma</Table.Th>
                    <Table.Th colSpan={2} ta="center">Nodes</Table.Th>
                </Table.Tr>
                <Table.Tr>
                    <Table.Th ta="center">X</Table.Th>
                    <Table.Th ta="center">Y</Table.Th>
                    <Table.Th ta="center">Z</Table.Th>
                    <Table.Th>Axon</Table.Th>
                    <Table.Th>Dendrite</Table.Th>
                    <Table.Th>Structure</Table.Th>
                    <Table.Th>X</Table.Th>
                    <Table.Th>Y</Table.Th>
                    <Table.Th>Z</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody bg="table">
                {rows}
            </Table.Tbody>
        </Table>
    );
};

type ReconstructionRowProps = {
    reconstruction: Annotation;
    isSelected: boolean;

    onSelected: (reconstruction: Annotation) => void;
}

export const ReconstructionRow = (props: ReconstructionRowProps) => {
    const subProps = props.isSelected ? {bg: "table-selection"} : {};

    const specimenSoma = selectSomaLocation(props.reconstruction.neuron.specimenSoma, props.reconstruction.specimenSpaceReconstruction?.soma);
    const nodeCounts = props.reconstruction.specimenSpaceReconstruction?.nodeCounts;

    const fragmentsUrl = props.reconstruction.neuron.specimen.referenceDataset?.segmentationUrl;

    const onCopyFragmentsUrl = async (evt: React.MouseEvent) => {
        evt.stopPropagation();
        await navigator.clipboard.writeText(fragmentsUrl);
        successNotification("Segmentation URL Copied to Clipboard", fragmentsUrl);
    }

    return (
        <Table.Tr key={props.reconstruction.id} {...subProps} onClick={() => props.onSelected(props.reconstruction)}>
            <Table.Td><NeuronVersionLink neuron={props.reconstruction.neuron}/></Table.Td>
            <Table.Td>
                <Group justify="space-between" wrap="nowrap" gap="xs">
                    <SpecimenLink specimen={props.reconstruction.neuron.specimen}/>
                    {fragmentsUrl ?
                        <Tooltip label="Copy specimen segmentation url">
                            <IconCopy size={14} style={{cursor: "pointer"}} onClick={onCopyFragmentsUrl}/>
                        </Tooltip> : null}
                </Group>
            </Table.Td>
            <ValueCell value={specimenSoma?.x?.toFixed(1)}/>
            <ValueCell value={specimenSoma?.y?.toFixed(1)}/>
            <ValueCell value={specimenSoma?.z?.toFixed(1)}/>
            <ValueCell value={nodeCounts?.axon?.total}/>
            <ValueCell value={nodeCounts?.dendrite?.total}/>
            <Table.Td>{formatAtlasStructure(props.reconstruction.neuron.atlasStructure, "(unspecified)")}</Table.Td>
            <Table.Td>{props.reconstruction.neuron.atlasSoma?.x.toFixed(1)}</Table.Td>
            <Table.Td>{props.reconstruction.neuron.atlasSoma?.y.toFixed(1)}</Table.Td>
            <Table.Td>{props.reconstruction.neuron.atlasSoma?.z.toFixed(1)}</Table.Td>
            <Table.Td>{formatUser(props.reconstruction.annotator)}</Table.Td>
            <Table.Td><ReconstructionStatusLabel reconstructions={props.reconstruction}/> </Table.Td>
        </Table.Tr>
    );
}

const ValueCell = ({value}: { value?: string | number }) => {
    return value != null ? <Table.Td ta="end">{value}</Table.Td> : <Table.Td ta="center">-</Table.Td>;
}
