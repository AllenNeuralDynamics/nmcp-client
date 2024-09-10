import * as React from "react";
import {Label} from "semantic-ui-react";

import {ReconstructionStatus, reconstructionStatusColor, reconstructionStatusString} from "../../models/reconstructionStatus";
import {IReconstruction} from "../../models/reconstruction";

interface IAnnotatorListProps {
    annotations: IReconstruction[]
    showCompleteOnly: boolean;
    showStatus: boolean;
    showProofreader: boolean;
}

export const AnnotatorList = (props: IAnnotatorListProps) => {
    const annotations = props.showCompleteOnly ?
        props.annotations.filter(a => a.status == ReconstructionStatus.Complete || a.status == ReconstructionStatus.Approved) :
        props.annotations;

    const displayFunction = props.showProofreader ? displayProofreader : displayAnnotation;

    if (!annotations || annotations.length == 0) {
        return (<p>None</p>);
    }

    if (annotations.length == 1) {
        return (<div>{displayFunction(annotations[0], props.showStatus)}</div>);
    }

    const first = {"marginTop": "0px"}
    const other = {"marginTop": "4px"}

    return (
        <div>
            {annotations.map((a, idx) => {
                return (
                    <div style={idx == 0 ? first : other} key={idx}>
                        {displayFunction(a, props.showStatus)}
                    </div>
                );
            })}
        </div>
    )
}

function displayAnnotation(a: IReconstruction, showStatus: boolean) {
    const label = showStatus ?
        <Label basic size="tiny" style={{marginRight: "8px"}} color={reconstructionStatusColor(a.status)}>{reconstructionStatusString(a.status)}</Label> : null;

    return (
        <div style={{display: "flex", justifyContent: "space-between"}}>
            <span>{`${a.annotator.firstName} ${a.annotator.lastName}`}</span>
            {label}
        </div>
    )
}

function displayProofreader(a: IReconstruction, showStatus: boolean) {

    if (!a.proofreader) {
        return <div>n/a</div>;
    }

    return (
        <div>
            <span>{`${a.proofreader.firstName} ${a.proofreader.lastName}`}</span>
        </div>
    )
}
