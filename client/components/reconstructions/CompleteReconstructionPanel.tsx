import * as React from "react";
import {Form, Grid, Input, TextArea} from "semantic-ui-react";

export type CompleteReconstructionData = {
    duration: string;
    length: string;
    notes: string;
    checks: string;
}

export type CompleteReconstructionPanelProps = {
    id: string;
    data: CompleteReconstructionData;

    updateDuration(value: string): void;
    updateLength(value: string): void;
    updateNotes(value: string): void;
    updateChecks(value: string): void;
}

export const CompleteReconstructionPanel = (props: CompleteReconstructionPanelProps) => {
    return (
        <Grid>
            <Grid.Row>
                <Grid.Column width={8}>
                    <Form>
                        <Form.Field>
                            <label>Duration</label>
                        </Form.Field>
                    </Form>
                </Grid.Column>
                <Grid.Column width={8}>
                    <Form>
                        <Form.Field>
                            <label>Length</label>
                        </Form.Field>
                    </Form>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row style={{paddingTop: 0}}>
                <Grid.Column width={8}>
                    <Input label={{basic: true, content: 'hr'}} labelPosition='right' placeholder='Enter duration...' value={props.data.duration}
                           onChange={(e, {name, value}) => props.updateDuration(value)}/>
                </Grid.Column>
                <Grid.Column width={8}>
                    <Input label={{basic: true, content: 'mm'}} labelPosition='right' placeholder='Enter length...' value={props.data.length}
                           onChange={(e, {name, value}) => props.updateLength(value)}/>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={8}>
                    <Form>
                        <Form.Field>
                            <label>Notes</label>
                        </Form.Field>
                    </Form>
                </Grid.Column>
                <Grid.Column width={8}>
                    <Form>
                        <Form.Field>
                            <label>Checks</label>
                        </Form.Field>
                    </Form>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row style={{paddingTop: 0}}>
                <Grid.Column width={8}>
                    <Form>
                        <TextArea placeholder="Enter notes..." value={props.data.notes}
                                  onChange={(e, {name, value}) => props.updateNotes(value.toString())}/>
                    </Form>
                </Grid.Column>
                <Grid.Column width={8}>
                    <Form>
                        <TextArea placeholder="Enter checks..." value={props.data.checks}
                                  onChange={(e, {name, value}) => props.updateChecks(value.toString())}/>
                    </Form>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column Width={16}>
                    <small>{`reference id: ${props.id}`}</small>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    )
}
