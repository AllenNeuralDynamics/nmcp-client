import * as React from "react";
import {useState} from "react";
import {Button, Dropdown, DropdownItemProps, Form, FormField, FormGroup, Header, Segment} from "semantic-ui-react";
import Dropzone from "react-dropzone";

import {FilePreview, SwcInputFile} from "./FilePreview";
import {displayTracingStructure, ITracingStructure} from "../../../models/tracingStructure";

const zoneStyle = (disabled: boolean, file: any) => {
    return {
        order: 0,
        backgroundColor: disabled ? "rgb(255, 246, 246)" : (file ? "rgb(243, 244, 245)" : "rgb(255, 230, 230)")
    };
}

export type SwcDropZoneProps = {
    isDisabled: boolean;
    file: File;
    isLoading: boolean;
    isSwcFile: boolean;
    elementName: string;

    selectedTracingStructure: ITracingStructure;

    tracingStructures: ITracingStructure[];

    onTracingStructureChanged(id: string): void;
    onFileReceived(file: File[]): void;
    onFileIsInvalid(): void;
    tryUploadSwc(): void;
}

export const SwcDropZone = (props: SwcDropZoneProps) => {
    const [swcInputFile, setSwcInputFile] = useState<SwcInputFile>(null);

    const tracingStructureOptions: DropdownItemProps[] = props.tracingStructures.map(t => {
        return {
            key: t.id,
            text: displayTracingStructure(t),
            value: t.id
        }
    });

    const structureDropDown = props.isSwcFile ? (<Dropdown placeholder={"Axon or dendrite..."} selection style={{marginLeft: "8px"}}
                                                           options={tracingStructureOptions}
                                                           value={props.selectedTracingStructure ? props.selectedTracingStructure.id : null}
                                                           disabled={props.isLoading}
                                                           onChange={(_, {value}) => props.onTracingStructureChanged(value as string)}/>) : null

    const structure = props.isSwcFile ? (
        <Segment style={{paddingBottom: "0px"}}>
            <Form style={{margin: "0px"}}>
                <FormGroup inline>
                    <FormField>
                        <label>Structure:</label>
                        {structureDropDown}
                    </FormField>
                    <i>Select which structure this SWC file represents</i>
                </FormGroup>
            </Form>
        </Segment>) : null;

    const canUploadTracing = (): boolean => {
        return (props.selectedTracingStructure || !props.isSwcFile) && props.file !== null;
    }

    return (
        <Segment.Group>
            <Segment secondary>
                <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
                    <Header style={{verticalAlign: "middle", order: 1, flexGrow: 0, flexShrink: 0, marginLeft: "12px", marginBottom: "0px", marginTop: "6px"}}>Reconstruction Data</Header>
                    <div style={{order: 2, flexGrow: 1, flexShrink: 1}}/>
                    <div style={{order: 3, flexGrow: 0, flexShrink: 0, marginRight: "12px"}}>
                        <Button content="Upload" icon="upload" size="tiny" labelPosition="right"
                                color="blue"
                                disabled={!canUploadTracing() || props.isLoading}
                                onClick={() => props.tryUploadSwc()}/>
                    </div>
                </div>
            </Segment>
            <Segment style={{padding: 0}} secondary>
                <Dropzone onDrop={props.onFileReceived}>
                    {({getRootProps, getInputProps}) => (
                        <div {...getRootProps()} className="dropzone-no-border" style={zoneStyle(props.isDisabled, props.file)}>
                            <input {...getInputProps()} />
                            <span style={NoFileStyle(!props.file, props.isDisabled)}>
                                {props.file ? props.file.name : "Drop an SWC or reconstruction JSON file - or click to browse for a file"}
                            </span>
                        </div>
                    )}
                </Dropzone>
            </Segment>
            {structure}
            <Segment style={{padding: 0}}>
                <div style={{display: "flex", flexDirection: "column", height:"280px"}}>
                    <FilePreview style={{order: 1, flexGrow: 1, border: "none", margin: 0}}
                                 file={props.file} elementName={props.elementName}
                                 onFileReceived={(file: File) => props.onFileReceived([file])}
                                 onFileIsInvalid={() => props.onFileIsInvalid()}
                                 onFileLoaded={(inputFile) => setSwcInputFile(inputFile)}/>
                </div>
            </Segment>
            <Segment style={{display: props.file !== null ? "block" : "none"}} secondary>
                {swcInputFile ? `Node Count: ${swcInputFile.nodeCount}` : ""}
            </Segment>
        </Segment.Group>
    );
}

export const NoFileStyle = (isMissing: boolean, loading: boolean) => {
    return {
        textAlign: "center" as const,
        width: "100%",
        margin: "10px",
        color: (isMissing || loading) ? "rgba(191, 191, 191, 0.870588)" : "black"
    };
};
