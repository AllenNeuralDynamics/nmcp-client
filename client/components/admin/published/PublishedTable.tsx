import React from "react";
import {Link} from "react-router-dom";
import {Table, Group} from "@mantine/core";

import {formatNeuron} from "../../../models/neuron";
import {formatAtlasStructure} from "../../../models/atlasStructure";
import {Reconstruction} from "../../../models/reconstruction";
import {ReconstructionStatusLabel} from "../../common/ReconstructionStatus";

export const PublishedTable = ({reconstructions}: { reconstructions: Reconstruction[] }) => {
    return (
        <Table withColumnBorders>
            <Table.Thead bg="table-header">
                <Table.Tr>
                    <Table.Th>Neuron</Table.Th>
                    <Table.Th>Specimen</Table.Th>
                    <Table.Th>Atlas Structure</Table.Th>
                    <Table.Th>Soma X</Table.Th>
                    <Table.Th>Soma Y</Table.Th>
                    <Table.Th>Soma Z</Table.Th>
                    <Table.Th>Axon Nodes</Table.Th>
                    <Table.Th>Dendrite Nodes</Table.Th>
                    <Table.Th>Annotator</Table.Th>
                    <Table.Th>Status</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody bg="table">
                {reconstructions.map((reconstruction: Reconstruction) => (
                    <PublishedRow reconstruction={reconstruction}/>
                ))}
            </Table.Tbody>
        </Table>
    );
}

const PublishedRow = ({reconstruction}: { reconstruction: Reconstruction }) => {
    return (
        <Table.Tr key={reconstruction.id}>
            <Table.Td>
                <Link to={`/neuron/${reconstruction.neuron.id}`}>{formatNeuron(reconstruction.neuron)}</Link>
            </Table.Td>
            <Table.Td>
                {reconstruction.neuron.specimen.label}
            </Table.Td>
            <Table.Td>
                {formatAtlasStructure(reconstruction.neuron.atlasStructure, "(unspecified)")}
            </Table.Td>
            <Table.Td ta="end">
                {reconstruction.neuron.atlasSoma.x.toFixed(1)}
            </Table.Td>
            <Table.Td ta="end">
                {reconstruction.neuron.atlasSoma.y.toFixed(1)}
            </Table.Td>
            <Table.Td ta="end">
                {reconstruction.neuron.atlasSoma.z.toFixed(1)}
            </Table.Td>
            <Table.Td ta="end">
                {reconstruction.atlasReconstruction.nodeCounts ? reconstruction.atlasReconstruction.nodeCounts.axon.total : "-"}
            </Table.Td>
            <Table.Td ta="end">
                {reconstruction.atlasReconstruction.nodeCounts ? reconstruction.atlasReconstruction.nodeCounts.dendrite.total : "-"}
            </Table.Td>
            <Table.Td>
                {`${reconstruction.annotator.firstName} ${reconstruction.annotator.lastName}`}
            </Table.Td>
            <Table.Td>
                <Group>
                    <ReconstructionStatusLabel reconstructions={reconstruction}/>
                </Group>
            </Table.Td>
        </Table.Tr>
    );
}
