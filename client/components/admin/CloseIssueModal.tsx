import * as React from "react";
import {useState} from "react";
import {Button, Form, FormField, FormInput, Message, Modal, TextArea} from "semantic-ui-react";
import {useMutation} from "@apollo/react-hooks";
import {
    CLOSE_ISSUE_MUTATION,
    CloseIssueResponse,
    CloseIssueVariables,
} from "../../graphql/issue";
import {IIssue, IssueKind} from "../../models/issue";
import {toast} from "react-toastify";

type CloseIssueModelProps = {
    show: boolean;
    issue: IIssue;

    onClose(): void;
}

export const CloseIssueModal = (props: CloseIssueModelProps) => {
    const [state, setState] = useState({
        reason: ""
    });

    const [closeIssue, {data: closeData, error: closeError}] = useMutation<CloseIssueResponse, CloseIssueVariables>(CLOSE_ISSUE_MUTATION, {
        refetchQueries: ["OPEN_ISSUES_QUERY"],
        onCompleted: async (closeData) => {
            if (!closeError && closeData.closeIssue) {
                toast.success((<div><h3>Report Issue</h3>The issue was successfully closed.</div>), {autoClose: 1000});
            } else {
                toast.error((<div><h3>Report Issue</h3>There was an unknown error closing this issue.</div>), {autoClose: false});
            }

            setState({...state, reason: ""});
        }
    });

    const onCloseClick = async () => {
        await closeIssue({
            variables: {id: props.issue.id, reason: state.reason}
        });

        props.onClose();
    }

    const isValidDescription = state.reason?.length > 0;

    return (
        <Modal closeIcon centered={false} open={props.show} onClose={props.onClose} dimmer="blurring">
            <Modal.Header content="Close Issue"/>
            <Modal.Content>
                <Form>
                    <FormField error={!isValidDescription}>
                        <TextArea placeholder="Enter reason..." value={state.reason}
                                  onChange={(e, {name, value}) => setState({...state, reason: value.toString()})}/>
                    </FormField>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button primary content="Close" disabled={!isValidDescription} onClick={onCloseClick}/>
            </Modal.Actions>
        </Modal>
    );
}
