import React, {useState} from "react"
import {useMutation} from "@apollo/client";
import * as uuid from "uuid";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardMeta,
    Icon,
    Input,
    List,
    Message,
    MessageHeader,
    MessageItem,
    MessageList
} from "semantic-ui-react"

import {IMPORT_SMARTSHEET_MUTATION, RELOAD_MUTATION} from "../../graphql/admin";

export const Manage = () => {

    const [state, setState] = useState({reconstructionId: "", accessToken: ""});

    const [reload] = useMutation(RELOAD_MUTATION);

    const [importSmartsheet] = useMutation(IMPORT_SMARTSHEET_MUTATION);

    return (
        <div>
            <Card.Group itemsPerRow={1}>
                <Card>
                    <CardContent>
                        <CardHeader>
                            SmartSheet Refresh
                            <List floated="right">
                                <Icon name="download" size="large" color="green" floated="right"/>
                            </List>
                        </CardHeader>
                        <CardMeta>Update the database using information in the SmartSheets table</CardMeta>
                        <CardDescription>
                            Data will be imported from the Neuron Reconstruction item in the ExASPIM Workspace. This
                            will update
                            samples, neurons, and reconstructions.
                        </CardDescription>
                        <br/>
                        <Input fluid label="Access Token" error={!state.accessToken} value={state.accessToken}
                               onChange={(e, {name, value}) => setState({...state, accessToken: value})}/>
                    </CardContent>
                    <CardContent extra>
                        <Button primary disabled={!state.accessToken}
                                onClick={() => importSmartsheet({variables: {id: state.accessToken}})}>
                            Import
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <CardHeader>
                            Reload
                            <List floated="right">
                                <Icon name="redo" size="large" color="orange" floated="right"/>
                            </List>
                        </CardHeader>
                        <CardMeta>Clear the reconstruction cache and reload all published reconstructions</CardMeta>
                        <CardDescription>
                            Clear the cache of all published reconstructions and reload them from the
                            database.
                            <p/>
                            <Message warning>
                                <MessageHeader>Danger Zone</MessageHeader>
                                <MessageList>
                                    <MessageItem>This is a method if last resort</MessageItem>
                                    <MessageItem>It will take on the order of several minutes for the cache to repopulate and all reconstructions to be available in the browser</MessageItem>
                                    <MessageItem>This only refreshes one part of the system and may not fix other issues.  A system restart may be required for some issues.</MessageItem>
                                    <MessageItem>Requesting a multiple reloads before is finished may have side effects</MessageItem>
                                </MessageList>
                            </Message>
                        </CardDescription>
                    </CardContent>
                    <CardContent extra>
                        <Button negative onClick={() => reload()}>
                            Reload
                        </Button>
                    </CardContent>
                </Card>
            </Card.Group>
        </div>
    );
}
