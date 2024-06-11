import * as React from "react";
import {Label} from "semantic-ui-react";

import {AnnotationStatus, annotationStatusColor, displayAnnotationStatus} from "../../models/annotationStatus";
import {IReconstruction} from "../../models/reconstruction";

interface IAnnotatorListProps {
    annotations: IReconstruction[]
    showCompleteOnly: boolean;
    showStatus: boolean;
    showProofreader: boolean;
}

export const AnnotatorList = (props: IAnnotatorListProps) => {
    const annotations  =  props.showCompleteOnly ?
        props.annotations.filter(a => a.status == AnnotationStatus.Complete || a.status == AnnotationStatus.Approved) :
        props.annotations;

    const displayFunction = props.showProofreader ? displayProofreader : displayAnnotation;

    if (!annotations || annotations.length == 0) {
        return (<p>None</p>);
    }

    if (annotations.length == 1) {
        return (<div>{displayFunction(annotations[0], props.showStatus)}</div>);
    }

    return (
        <ul>
            {annotations.map(a => {
                return (
                    <li>{displayFunction(a, props.showStatus)}</li>
                );
            })}
        </ul>
    )
}

function displayAnnotation(a: IReconstruction, showStatus: boolean) {
    const label = showStatus ? <Label style={{marginRight: "8px"}} color={annotationStatusColor(a.status)}>{displayAnnotationStatus(a.status)}</Label> : null;

    return (
        <div>
            {label}
            <span>{`${a.annotator.firstName} ${a.annotator.lastName}`}</span>
        </div>
    )
}

function displayProofreader(a: IReconstruction, showStatus: boolean) {

    if (!a.proofreader) {
        return <div>N/A</div>;
    }

    return (
        <div>
            <span>{`${a.proofreader.firstName} ${a.proofreader.lastName}`}</span>
        </div>
    )
}
