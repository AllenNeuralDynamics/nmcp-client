import * as React from "react";
import {Icon, TableCell, TableRow} from "semantic-ui-react";
import {toast} from "react-toastify";

import {displayNeuron, formatHortaLocation, INeuron} from "../../models/neuron";
import {displayBrainArea} from "../../models/brainArea";
import {AnnotatorList} from "../common/AnnotatorList";

export interface ICandidateRowProps {
    key: string
    neuron: INeuron;
    showAnnotators: boolean;
    isSelected: boolean;

    onSelected: (neuron: INeuron) => void;
}

export const CandidateRow = (props: ICandidateRowProps) => {
    const onCopyHorta = async () => {
        await navigator.clipboard.writeText(formatHortaLocation(props.neuron));
        toast.success((<div>
            <h3>Location Copied to Clipboard</h3>
            {formatHortaLocation(props.neuron)}
        </div>), {autoClose: 1000});
    }

    return (
        <TableRow onClick={() => props.onSelected(props.neuron)} active={props.isSelected}>
            <TableCell>{displayNeuron(props.neuron)}</TableCell>
            <TableCell>{props.neuron.sample.animalId}</TableCell>
            <TableCell>{props.neuron.tag}</TableCell>
            <TableCell>{displayBrainArea(props.neuron.brainArea, "(unspecified)")}</TableCell>
            <TableCell>{props.neuron.x.toFixed(1)}</TableCell>
            <TableCell>{props.neuron.y.toFixed(1)}</TableCell>
            <TableCell>{props.neuron.z.toFixed(1)}</TableCell>
            <TableCell><Icon name="copy" onClick={async () => {await onCopyHorta()}}/>{formatHortaLocation(props.neuron)}</TableCell>
            {props.showAnnotators ?
                <TableCell>
                    <AnnotatorList annotations={props.neuron.reconstructions} showCompleteOnly={false} showStatus={true} showProofreader={false}/>
                </TableCell>
                : null}
        </TableRow>
    )
}
