import * as React from "react";
import {useEffect, useState} from "react";
import {Button, Checkbox, Flex, Divider, Stack, TextInput} from "@mantine/core";
import {IconUpload} from '@tabler/icons-react';

import Dropzone from "react-dropzone";
import {NoFileStyle} from "../../review/upload/SwcDropZone";
import {SomaImportOptions} from "./ImportSomasModal";

const zoneStyle = (disabled: boolean, file: any) => {
    return {
        order: 0,
        backgroundColor: disabled ? "rgb(255, 246, 246)" : (file ? "rgb(243, 244, 245)" : "rgb(255, 230, 230)")
    };
}

type ImportSomasPanelProps = {
    onImport(options: SomaImportOptions): void;
}

export const ImportSomasPanel = (props: ImportSomasPanelProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [shouldApplyTag, setShouldApplyTag] = useState(false);
    const [tag, setTag] = useState("");
    const [shouldLookupSoma, setShouldLookupSoma] = useState(true);
    const [canImport, setCanImport] = useState(false);

    useEffect(() => {
        setCanImport(file != null);
    }, [file]);

    const onFileReceived = (acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        } else {
            setFile(null);
        }
    }

    return (
        <Stack>
            <Dropzone onDrop={onFileReceived}>
                {({getRootProps, getInputProps}) => (
                    <div {...getRootProps()} className="dropzone-no-border" style={zoneStyle(false, file)}>
                        <input {...getInputProps()} />
                        <span style={NoFileStyle(!file, false)}>
                                {file ? file.name : "Drop a soma properties CSV file - or click to browse for one"}
                            </span>
                    </div>
                )}
            </Dropzone>

            <div>
                <Checkbox checked={shouldApplyTag} label="Apply a tag value to all untagged rows"
                          onChange={(event) => setShouldApplyTag(event.currentTarget.checked)}/>
                <TextInput label="Tag" placeholder="AIND" disabled={!shouldApplyTag} value={tag}
                           onChange={(event) => setTag(event.currentTarget.value)}/>
            </div>

            <Checkbox checked={shouldLookupSoma} label="Use Atlas lookup for unspecified soma structures"
                      onChange={(event) => setShouldLookupSoma(event.currentTarget.checked)}/>

            <Divider my="md"/>

            <Flex justify="flex-end">
                <Button disabled={!canImport} rightSection={<IconUpload size={14}/>}
                        onClick={() => props.onImport({tag: shouldApplyTag ? tag : null, shouldLookupSoma: shouldLookupSoma, file: file})}>
                        Import
                </Button>
            </Flex>
        </Stack>
    );
}
