import React, {useState} from "react";
import {Button, Grid, Header, Icon, Message, Segment, Table, TableCell, TableRow} from "semantic-ui-react";
import {useMutation, useQuery} from "@apollo/client";
import {IssueQueryResponse, CLOSE_ISSUE_MUTATION, CloseIssueResponse, CloseIssueVariables, OPEN_ISSUES_QUERY} from "../../graphql/issue";
import {IIssue, issueKindString} from "../../models/issue";
import moment from "moment";
import {toast} from "react-toastify";
import {CloseIssueModal} from "./CloseIssueModal";

export const Issues = () => {
    const [state, setState] = useState({
        isCloseIssueModalVisible: false,
        issue: null
    });

    const [closeIssue, {data: closeData, error: closeError}] = useMutation<CloseIssueResponse, CloseIssueVariables>(CLOSE_ISSUE_MUTATION, {
        refetchQueries: ["OPEN_ISSUES_QUERY"],
        onCompleted: async (closeData) => {
            if (!closeError && closeData.closeIssue) {
                toast.success((<div><h3>Report Issue</h3>The issue was successfully closed.</div>), {autoClose: 1000});
            } else {
                toast.error((<div><h3>Report Issue</h3>There was an unknown error closing this issue.</div>), {autoClose: false});
            }
        }
    });

    const {loading, error, data} = useQuery<IssueQueryResponse>(OPEN_ISSUES_QUERY, {
        pollInterval: 10000
    });

    if (loading || !data) {
        return (<div>loading...</div>)
    }

    if (!data.openIssues || data.openIssues.length == 0) {
        return (
            <div style={{margin: "64px 128px"}}>
                <Segment placeholder>
                    <Header icon color="green">
                        <Icon name="check"/>
                        There are no open issues.
                    </Header>
                </Segment>
            </div>
        );
    }

    const onTryCloseIssue = async (issue: IIssue) => {
        setState({...state, issue: issue, isCloseIssueModalVisible: true});
    }

    const rows = data.openIssues.map(r => IssueRow({issue: r, onTryCloseIssue: onTryCloseIssue}));

    return (
        <div style={{margin: "0"}}>
            <Segment.Group>
                <Segment secondary>
                    <Header style={{margin: "0"}}>Issues</Header>
                </Segment>
                <Table attached="bottom" compact="very">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Sample</Table.HeaderCell>
                            <Table.HeaderCell>Neuron</Table.HeaderCell>
                            <Table.HeaderCell>Kind</Table.HeaderCell>
                            <Table.HeaderCell>Description</Table.HeaderCell>
                            <Table.HeaderCell>Reported By</Table.HeaderCell>
                            <Table.HeaderCell>Reported On</Table.HeaderCell>
                            <Table.HeaderCell/>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                </Table>
            </Segment.Group>
            <CloseIssueModal show={state.isCloseIssueModalVisible} issue={state.issue} onClose={() => setState({...state, isCloseIssueModalVisible: false})}/>
        </div>
    );
};

export type IssueProps = {
    issue: IIssue;

    onTryCloseIssue(issue: IIssue): void;
}

const IssueRow = (props: IssueProps) => {
    return (<TableRow>
            <TableCell>{props.issue.neuron.sample.animalId}</TableCell>
            <TableCell>{props.issue.neuron.idString}</TableCell>
            <TableCell>{issueKindString(props.issue.kind)}</TableCell>
            <TableCell>{props.issue.description}</TableCell>
            <TableCell>
                {props.issue.creator.firstName} {props.issue.creator.lastName}
                <br/>
                <small>{props.issue.creator.emailAddress}</small>
            </TableCell>
            <TableCell>{moment(props.issue.createdAt).format("YYYY-MM-DD")}</TableCell>
            <TableCell>
                <Button primary size="mini" content="Close" onClick={() => props.onTryCloseIssue(props.issue)}/>
            </TableCell>
        </TableRow>
    );
}
