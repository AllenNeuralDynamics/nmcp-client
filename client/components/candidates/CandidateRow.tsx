import * as React from "react";
import {TableCell, TableRow} from "semantic-ui-react";

import {displayNeuron, INeuron} from "../../models/neuron";
import {displayBrainArea} from "../../models/brainArea";
import {AnnotatorList} from "../annotator/AnnotatorList";

export interface ICandidateRowProps {
    key: string
    neuron: INeuron;
    showAnnotators: boolean;
    isSelected: boolean;

    onSelected: (neuron: INeuron) => void;
}

export const CandidateRow = (props: ICandidateRowProps) => {
    return (
        <TableRow onClick={() => props.onSelected(props.neuron)} active={props.isSelected}>
            <TableCell>{displayNeuron(props.neuron)}</TableCell>
            <TableCell>{props.neuron.sample.animalId}</TableCell>
            <TableCell>{displayBrainArea(props.neuron.brainArea, "(unspecified)")}</TableCell>
            <TableCell>{props.neuron.x.toFixed(1)}</TableCell>
            <TableCell>{props.neuron.y.toFixed(1)}</TableCell>
            <TableCell>{props.neuron.z.toFixed(1)}</TableCell>
            {props.showAnnotators ?
                <TableCell>
                    <AnnotatorList annotations={props.neuron.reconstructions} showCompleteOnly={false} showStatus={true} showProofreader={false}/>
                </TableCell>
                : null}
        </TableRow>
    )
}
