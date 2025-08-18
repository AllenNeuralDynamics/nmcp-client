import * as React from "react";
import {useContext, useState} from "react";
import {DocumentNode, useMutation} from "@apollo/client";
import {ApolloError} from "@apollo/client";
import {Grid, Confirm} from "semantic-ui-react";
import {toast} from "react-toastify";
import {SwcDropZone} from "./SwcDropZone";

import {IReconstruction} from "../../../models/reconstruction";
import {ITracingStructure} from "../../../models/tracingStructure";
import {ISwcUploadOutput} from "../../../models/swcTracing";
import {UploadTracingMutationResponse, UploadTracingVariables} from "../../../graphql/tracings";
import {ConstantsContext} from "../../app/AppConstants";

export interface ICreateTracingProps {
    reconstruction: IReconstruction;
    elementName: string;
    mutation: DocumentNode;
    refetchQueries: string[];
}

export interface ICreateTracingState {
    isFileAlertOpen: boolean;
    invalidFileName: string;
    isSwcFile: boolean;
    file: File;
    structure: ITracingStructure;
}

export const CreateTracing: React.FC<ICreateTracingProps> = (props) => {
    const [state, setState] = useState<ICreateTracingState>({
        isFileAlertOpen: false,
        invalidFileName: "",
        isSwcFile: false,
        file: null,
        structure: null,
    });

    const constants = useContext(ConstantsContext);

    const [uploadSwc, {loading}] = useMutation<UploadTracingMutationResponse, UploadTracingVariables>(props.mutation,
        {
            onCompleted: (data: any) => onUploadComplete(data),
            onError: (error: any) => onUploadError(error),
            refetchQueries: props.refetchQueries
        });

    function onTracingStructureChange(structureId: string) {
        if (!state.structure || structureId !== state.structure.id) {
            setState({...state, structure: constants.TracingStructures.find(t => t.id === structureId)});
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
        if (data.uploadSwc) {
            useUploadComplete(data.uploadSwc);
        } else if (data.uploadUnregisteredSwc) {
            useUploadComplete(data.uploadUnregisteredSwc);
        }
    }

    function useUploadComplete(data: any) {
        if (data.error != null) {
            console.log(data.error);
            toast.error(uploadErrorContent(data.error), {autoClose: false});
        } else {
            resetUploadState();
            toast.success(uploadSuccessContent(data), {});
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
                        <SwcDropZone isLoading={loading} isSwcFile={state.isSwcFile} elementName={props.elementName}
                                     isDisabled={loading} file={state.file}
                                     selectedTracingStructure={state.structure}
                                     tracingStructures={constants.TracingStructures}
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
