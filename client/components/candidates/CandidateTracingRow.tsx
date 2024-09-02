import * as React from "react";
import {useContext} from "react";
import {useMutation} from "@apollo/react-hooks";
import {Button, Label, Popup, TableCell, TableRow} from "semantic-ui-react";

import {REQUEST_ANNOTATION_MUTATION} from "../../graphql/reconstruction";
import {displayNeuron, INeuron} from "../../models/neuron";
import {displayBrainArea} from "../../models/brainArea";
import {isUserReconstruction} from "../../models/reconstruction";
import {AnnotatorList} from "../annotator/AnnotatorList";
import {UserContext} from "../app/UserApp";
import {CREATE_ISSUE_MUTATION, CreateIssueResponse, CreateIssueVariables} from "../../graphql/issue";
import {annotationStatusColor, displayAnnotationStatus} from "../../models/annotationStatus";

export interface ICandidateRowProps {
    key: string
    neuron: INeuron;
}

export const CandidateTracingRow = (props: ICandidateRowProps) => {

    const [requestAnnotation, {data: requestData}] = useMutation(REQUEST_ANNOTATION_MUTATION,
        {
            refetchQueries: ["CandidateNeuronsQuery"]
        });

    const [createIssue, {data: createIssueData}] = useMutation<CreateIssueResponse, CreateIssueVariables>(CREATE_ISSUE_MUTATION);

    const user = useContext(UserContext);

    const annotateButton = isUserReconstruction(user.id, props.neuron.reconstructions) ? <div/> :
        <Button icon="edit" color="green" size="mini" content="Annotate" onClick={() => requestAnnotation({variables: {id: props.neuron.id}})}/>

    const reportIssueButton =
        <Button circular compact color="red" size="mini" icon="exclamation"
                onClick={() => createIssue({variables: {description: "A new issue", neuronId: props.neuron.id}})}/>

    const reportWithPopup = <Popup content="Report an issue with this candidate" trigger={reportIssueButton} />

    return (
        <TableRow>
            <TableCell>{displayNeuron(props.neuron)}</TableCell>
            <TableCell>{props.neuron.sample.animalId}</TableCell>
            <TableCell>{displayBrainArea(props.neuron.brainArea, "(unspecified)")}</TableCell>
            <TableCell>{props.neuron.x.toFixed(1)}</TableCell>
            <TableCell>{props.neuron.y.toFixed(1)}</TableCell>
            <TableCell>{props.neuron.z.toFixed(1)}</TableCell>
            <TableCell>
                <AnnotatorList annotations={props.neuron.reconstructions} showCompleteOnly={false} showStatus={true} showProofreader={false}/>
            </TableCell>
            <TableCell>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    {annotateButton}
                </div>
            </TableCell>
        </TableRow>
    )
}
