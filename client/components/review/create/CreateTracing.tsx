import * as React from "react";
import {ApolloError} from "apollo-client";
import {Grid, Header, Segment, Button, Confirm} from "semantic-ui-react";
import {toast} from "react-toastify";

import {INeuron} from "../../../models/neuron";
import {ITracingStructure} from "../../../models/tracingStructure";
import {ISwcUploadOutput} from "../../../models/swcTracing";
import {UPLOAD_TRACING_MUTATION, UploadTracingMutationResponse, UploadTracingVariables} from "../../../graphql/tracings";
import {SwcDropZone} from "./SwcDropZone";
import {TracingInput} from "./TracingInput";
import {useState} from "react";
import {useMutation} from "@apollo/react-hooks";

export interface ICreateTracingProps {
    neurons: INeuron[];
    tracingStructures: ITracingStructure[];
    shouldClearCreateContentsAfterUpload: boolean;
}

interface ICreateTracingState {
    isFileAlertOpen: boolean;
    invalidFileName: string;
    isSwcFile: boolean;
    file: File;
    structure: ITracingStructure;
    neuron: INeuron;
}

export const CreateTracing = (props: ICreateTracingProps) => {
    const [state, setState] = useState<ICreateTracingState>({
        isFileAlertOpen: false,
        invalidFileName: "",
        isSwcFile: false,
        file: null,
        neuron: null,
        structure: null,
    });

    const [uploadSwc, {loading}] = useMutation<UploadTracingMutationResponse, UploadTracingVariables>(UPLOAD_TRACING_MUTATION,
        {
            onCompleted: (data: any) => onUploadComplete(data),
            onError: (error: any) => onUploadError(error)
        });

    function onNeuronChange(neuron: INeuron) {
        if (neuron !== state.neuron) {
            setState({...state, neuron, structure: null});
        }
    }

    function onTracingStructureChange(structureId: string) {
        if (!state.structure || structureId !== state.structure.id) {
            setState({...state, structure: props.tracingStructures.find(t => t.id === structureId)});
        }
    }

    function canUploadTracing(): boolean {
        return state.neuron && (state.structure || !state.isSwcFile) && state.file !== null;
    }

    function setSwcFile(acceptedFiles: File[]) {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setState({...state, file: acceptedFiles[0], isSwcFile: acceptedFiles[0].name.endsWith(".swc")});
        } else {
            setState({...state, file: null, isSwcFile: false});
        }
    }

    function resetUploadState() {
        setState({...state, file: null});

        if (props.shouldClearCreateContentsAfterUpload) {
            setState({
                ...state,
                structure: null,
                neuron: null,
            });
        }
    }

    async function tryUploadSwc() {
        if (canUploadTracing()) {
            try {
                await uploadSwc({
                    variables: {
                        neuronId: state.neuron.id,
                        structureId: state.structure ? state.structure.id : null,
                        file: state.file
                    }
                });
            } catch (error) {
                toast.error(uploadErrorContent(error), {autoClose: false});
            }
        }
    }

    async function onUploadComplete(data: UploadTracingMutationResponse) {
        if (data.uploadSwc.error != null) {
            console.log(data.uploadSwc.error);
            toast.error(uploadErrorContent(data.uploadSwc.error), {autoClose: false});
        } else {
            resetUploadState();
            toast.success(uploadSuccessContent(data.uploadSwc), {});
        }
    }

    async function onUploadError(error: ApolloError) {
        console.log(error);
        toast.error(uploadErrorContent(error), {autoClose: false});
    }

    return (
        <div>
            <Confirm content={`${state.invalidFileName} does not appear to contain SWC data.`}
                     open={state.isFileAlertOpen} cancelButton={null}
                     onConfirm={() => setState({...state, isFileAlertOpen: false})}/>
            <div>
                <Segment secondary attached="top"
                         style={{
                             display: "flex",
                             alignItems: "center",
                             justifyContent: "space-between"
                         }}>
                    <Header content="Upload Tracing" style={{margin: "0"}}/>
                    <Button content="Upload" icon="upload" size="tiny" labelPosition="right"
                            color="blue"
                            disabled={!canUploadTracing() || loading}
                            onClick={() => tryUploadSwc()}/>
                </Segment>
                <Segment attached="bottom">
                    <Grid fluid="true">
                        <Grid.Row style={{paddingBottom: 10}}>
                            <Grid.Column width={8}>
                                <Grid fluid="true">
                                    <Grid.Row>
                                        <Grid.Column width={16}>
                                            <SwcDropZone isDisabled={loading} file={state.file}
                                                         onFileReceived={files => setSwcFile(files)}
                                                         onFileIsInvalid={() => {
                                                             setState({
                                                                 ...state,
                                                                 isFileAlertOpen: true,
                                                                 invalidFileName: state.file ? state.file.name : ""
                                                             });
                                                             setSwcFile(null)
                                                         }}/>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <TracingInput isLoading={loading} isSwcFile={state.isSwcFile} selectedNeuron={state.neuron} selectedTracingStructure={state.structure}
                                              neurons={props.neurons} tracingStructures={props.tracingStructures}
                                              onNeuronChanged={n => onNeuronChange(n)} onTracingStructureChanged={(s) => onTracingStructureChange(s)}/>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </div>
        </div>
    );
}

const uploadSuccessContent = (output: ISwcUploadOutput) => {
    return (
        <div>
            <h3>Upload successful</h3>
            {`${output.tracings[0].filename}`}
            <br/>
            {`${output.tracings[0].nodeCount} nodes loaded from file`}
            <br/>
            &nbsp;
        </div>
    );
};

const uploadErrorContent = (error: Error) => {
    return (<div><h3>Upload failed</h3>{error ? error.message : "(no additional details available)"}</div>);
};
