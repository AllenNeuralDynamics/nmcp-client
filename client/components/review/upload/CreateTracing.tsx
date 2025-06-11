import * as React from "react";
import {useState} from "react";
import {useMutation} from "@apollo/client";
import {ApolloError} from "@apollo/client";
import {Grid, Confirm} from "semantic-ui-react";
import {toast} from "react-toastify";
import {SwcDropZone} from "./SwcDropZone";

import {IReconstruction} from "../../../models/reconstruction";
import {ITracingStructure} from "../../../models/tracingStructure";
import {ISwcUploadOutput} from "../../../models/swcTracing";
import {UPLOAD_TRACING_MUTATION, UploadTracingMutationResponse, UploadTracingVariables} from "../../../graphql/tracings";

export interface ICreateTracingProps {
    reconstruction: IReconstruction;
    tracingStructures: ITracingStructure[];
}

interface ICreateTracingState {
    isFileAlertOpen: boolean;
    invalidFileName: string;
    isSwcFile: boolean;
    file: File;
    structure: ITracingStructure;
}

export const CreateTracing = (props: ICreateTracingProps) => {
    const [state, setState] = useState<ICreateTracingState>({
        isFileAlertOpen: false,
        invalidFileName: "",
        isSwcFile: false,
        file: null,
        structure: null,
    });

    const [uploadSwc, {loading}] = useMutation<UploadTracingMutationResponse, UploadTracingVariables>(UPLOAD_TRACING_MUTATION,
        {
            onCompleted: (data: any) => onUploadComplete(data),
            onError: (error: any) => onUploadError(error),
            refetchQueries: ["ReviewableReconstructions", "CandidatesForReview"]
        });

    function onTracingStructureChange(structureId: string) {
        if (!state.structure || structureId !== state.structure.id) {
            setState({...state, structure: props.tracingStructures.find(t => t.id === structureId)});
        }
    }

    function canUploadTracing(): boolean {
        return props.reconstruction && (state.structure || !state.isSwcFile) && state.file !== null;
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
    }

    async function tryUploadSwc() {
        if (canUploadTracing()) {
            try {
                await uploadSwc({
                    variables: {
                        reconstructionId: props.reconstruction.id,
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
            <Confirm content={`${state.invalidFileName} does not appear to contain SWC or reconstruction JSON data.`}
                     open={state.isFileAlertOpen} cancelButton={null}
                     onConfirm={() => setState({...state, isFileAlertOpen: false})}/>

            <Grid fluid="true">
                <Grid.Row>
                    <Grid.Column width={16}>
                        <SwcDropZone isLoading={loading} isSwcFile={state.isSwcFile}
                                     isDisabled={loading} file={state.file}
                                     selectedTracingStructure={state.structure}
                                     tracingStructures={props.tracingStructures}
                                     onTracingStructureChanged={(s) => onTracingStructureChange(s)}
                                     onFileReceived={files => setSwcFile(files)}
                                     tryUploadSwc={tryUploadSwc}
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
