import {INeuron} from "../../models/neuron";
import * as React from "react";
import {useState} from "react";
import {Button, Form, FormField, FormInput, Message, Modal, TextArea} from "semantic-ui-react";
import {useMutation} from "@apollo/react-hooks";
import {CREATE_ISSUE_MUTATION, CreateIssueResponse, CreateIssueVariables} from "../../graphql/issue";
import {IssueKind} from "../../models/issue";
import {toast} from "react-toastify";

type IssueModelProps = {
    show: boolean;
    neuron: INeuron;

    onClose(): void;
}

const MIN_DESCRIPTION_LENGTH = 48;
const MAX_DESCRIPTION_LENGTH = 1024;

export const IssueModal = (props: IssueModelProps) => {
    const [state, setState] = useState({
        description: ""
    });

    const [createIssue, {data, error}] = useMutation<CreateIssueResponse, CreateIssueVariables>(CREATE_ISSUE_MUTATION, {
        onCompleted: async (data) => {
            if (!error && data.createIssue) {
                toast.success((<div><h3>Report Issue</h3>The issue was successfully reported.</div>), {autoClose: 1000});
            } else {
                toast.error((<div><h3>Report Issue</h3>There was an unknown issue reporting this issue.</div>), {autoClose: false});
            }

            setState({description: ""});
        }
    });

    const onReportClick = async () => {
        const description = state.description?.length < MAX_DESCRIPTION_LENGTH ? state.description : state.description.substring(0, MAX_DESCRIPTION_LENGTH);

        await createIssue({
            variables: {description: description, kind: IssueKind.Candidate, neuronId: props.neuron?.id}
        });

        props.onClose();
    }

    const isValidDescription = state.description?.length > MIN_DESCRIPTION_LENGTH;

    let warningMessage = isValidDescription ? null : (
        <Message
            error
            content="Please add additional detail about the issue."
        />);

    if (isValidDescription && state.description.length > MAX_DESCRIPTION_LENGTH) {
        const message = `Your description will be truncated due to length.`;

        warningMessage = (
            <Message
                warning
                content={message}
            />);
    }

    return (
        <Modal closeIcon centered={false} open={props.show} onClose={props.onClose} dimmer="blurring">
            <Modal.Header content="Report an issue"/>
            <Modal.Content>
                <Form>
                    <FormField error={!isValidDescription}>
                        <label>Describe the issue with Candidate Neuron {props.neuron.idString}</label>
                        <TextArea placeholder="Enter description..." value={state.description}
                                  onChange={(e, {name, value}) => setState({...state, description: value.toString()})}/>
                    </FormField>
                </Form>
                {warningMessage}
            </Modal.Content>
            <Modal.Actions>
                <Button color="red" content="Report" disabled={!isValidDescription} onClick={onReportClick}/>
            </Modal.Actions>
        </Modal>
    );
}
