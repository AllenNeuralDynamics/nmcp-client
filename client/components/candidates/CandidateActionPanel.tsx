import * as React from "react";
import {useContext} from "react";
import {useMutation} from "@apollo/react-hooks";
import {Button, Header, HeaderContent, HeaderSubheader, Icon} from "semantic-ui-react";
import {findIndex} from "lodash-es";

import {INeuron} from "../../models/neuron";
import {REQUEST_ANNOTATION_MUTATION} from "../../graphql/reconstruction";
import {UserContext} from "../app/UserApp";
import {isUserReconstruction} from "../../models/reconstruction";


export type CandidateActionPanelProps = {
    neuronId: string;
    neurons: INeuron[];
}

export const CandidateActionPanel = (props: CandidateActionPanelProps) => {

    const [requestAnnotation, {loading}] = useMutation(REQUEST_ANNOTATION_MUTATION,
        {
            refetchQueries: ["CandidateNeuronsQuery"]
        });

    const user = useContext(UserContext);

    if (!props.neuronId) {
        return <NoCandidate/>;
    }

    const idx = findIndex(props.neurons, (n) => n.id === props.neuronId);

    if (idx < 0) {
        return <NoCandidate/>;
    }

    const neuron = props.neurons[idx];

    const canAnnotate = !loading && !isUserReconstruction(user.id, neuron.reconstructions)

    const annotateButton = <Button icon="edit" color="green" size="mini" disabled={!canAnnotate} content="Add to My Annotations"
                                   onClick={() => requestAnnotation({variables: {id: neuron.id}})}/>

    return (
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <Header as="h4" style={{margin: 0}}>
                <Icon name="code branch"/>
                <HeaderContent>
                    {neuron.idString}
                    <HeaderSubheader>
                        Subject {neuron.sample.animalId}
                    </HeaderSubheader>
                </HeaderContent>
            </Header>
            {annotateButton}
        </div>
    )
}

const NoCandidate = () => (
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <Header as="h4" style={{margin: 0}}>
            <Icon name="code branch"/>
            <HeaderContent>
                No Candidate Selected
                <HeaderSubheader>
                    Select a candidate for additional options.
                </HeaderSubheader>
            </HeaderContent>
        </Header>
    </div>
)
