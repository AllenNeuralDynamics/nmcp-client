import * as React from "react";
import {useState} from "react";
import {Segment} from "semantic-ui-react";
import Dropzone from "react-dropzone";

import {FilePreview, SwcInputFile} from "./FilePreview";

const zoneStyle = (disabled: boolean, file: any) => {
    return {
        order: 0,
        backgroundColor: disabled ? "rgb(255, 246, 246)" : (file ? "white" : "rgb(255, 230, 230)")
    };
}

export type SwcDropZoneProps = {
    isDisabled: boolean;
    file: File;

    onFileReceived(file: File[]): void;
    onFileIsInvalid(): void;
}

export const SwcDropZone = (props: SwcDropZoneProps) => {
    const [swcInputFile, setSwcInputFile] = useState<SwcInputFile>(null);

    return (
        <Segment.Group>
            <Segment style={{padding: 0}}>
                <Dropzone onDrop={props.onFileReceived}>
                    {({getRootProps, getInputProps}) => (
                        <div {...getRootProps()} className="dropzone-no-border" style={zoneStyle(props.isDisabled, props.file)}>
                            <input {...getInputProps()} />
                            <span style={NoFileStyle(!props.file, props.isDisabled)}>
                            {props.file ? props.file.name : "Drop a SWC file or click to browse for a file"}
                        </span>
                        </div>
                    )}
                </Dropzone>
            </Segment>
            <Segment style={{padding: 0}}>
                <div style={{display: "flex", flexDirection: "column", height: "600px"}}>
                    <FilePreview style={{order: 1, flexGrow: 1, border: "none", margin: 0}}
                                 file={props.file}
                                 onFileReceived={(file: File) => props.onFileReceived([file])}
                                 onFileIsInvalid={() => props.onFileIsInvalid()}
                                 onFileLoaded={(inputFile) => setSwcInputFile(inputFile)}/>
                </div>
            </Segment>
            <Segment style={{display: props.file !== null ? "block" : "none"}}>
                {swcInputFile ? `Node Count: ${swcInputFile.nodeCount}` : ""}
            </Segment>
        </Segment.Group>
    );
}

const NoFileStyle = (isMissing: boolean, loading: boolean) => {
    return {
        textAlign: "center" as const,
        width: "100%",
        margin: "10px",
        color: (isMissing || loading) ? "rgba(191, 191, 191, 0.870588)" : "black"
    };
};
