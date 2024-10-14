import React, {useState} from "react"
import {useMutation} from "@apollo/react-hooks";
import * as uuid from "uuid";
import {Button, Card, CardContent, CardDescription, CardHeader, CardMeta, Icon, Input, List} from "semantic-ui-react"

import {IMPORT_SMARTSHEET_MUTATION, RELOAD_MUTATION, UNPUBLISH_MUTATION} from "../../graphql/admin";

export const Manage = () => {

    const [state, setState] = useState({reconstructionId: "", accessToken: ""});

    const [reload] = useMutation(RELOAD_MUTATION);

    const [unpublish] = useMutation(UNPUBLISH_MUTATION);

    const [importSmartsheet] = useMutation(IMPORT_SMARTSHEET_MUTATION);

    return (
        <div>
            <Card.Group itemsPerRow={2}>
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
                            Unpublish
                            <List floated="right">
                                <Icon name="book" size="large" color="red" floated="right"/>
                            </List>
                        </CardHeader>
                        <CardMeta>Remove a reconstruction from the published data set</CardMeta>
                        <CardDescription>
                            Unpublishing a reconstruction will remove it from the published data set and return it to an
                            "Approved" state. It will be available on the Review Reconstructions tab.
                        </CardDescription>
                        <br/>
                        <Input fluid label="Internal Id" error={!uuid.validate(state.reconstructionId)}
                               value={state.reconstructionId}
                               onChange={(e, {name, value}) => setState({...state, reconstructionId: value})}/>
                    </CardContent>
                    <CardContent extra>
                        <Button negative disabled={!uuid.validate(state.reconstructionId)}
                                onClick={() => unpublish({variables: {id: state.reconstructionId}})}>
                            Unpublish
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
                            This will clear the cache of all published reconstructions and reload them from the
                            database. This may take some time.
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
