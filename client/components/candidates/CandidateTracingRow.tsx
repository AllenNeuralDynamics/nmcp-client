import * as React from "react";
import {useContext} from "react";
import {useMutation} from "@apollo/react-hooks";
import {Button, TableCell, TableRow} from "semantic-ui-react";

import {REQUEST_ANNOTATION_MUTATION} from "../../graphql/reconstruction";
import {displayNeuron, INeuron} from "../../models/neuron";
import {displayBrainArea} from "../../models/brainArea";
import {isUserReconstruction} from "../../models/reconstruction";
import {AnnotatorList} from "../annotator/AnnotatorList";
import {UserContext} from "../app/UserApp";

export interface ICandidateRowProps {
    key: string
    neuron: INeuron;
}

export const CandidateTracingRow = (props: ICandidateRowProps) => {

    const [requestAnnotation, {data: requestData}] = useMutation(REQUEST_ANNOTATION_MUTATION,
        {
            refetchQueries: ["CandidateNeuronsQuery"]
        });

    const user = useContext(UserContext);

    const button = isUserReconstruction(user.id, props.neuron.reconstructions) ? null :
        <Button icon="edit" size="mini" content="Annotate" onClick={() => requestAnnotation({variables: {id: props.neuron.id}})}/>

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
                {button}
            </TableCell>
        </TableRow>
    )
}
