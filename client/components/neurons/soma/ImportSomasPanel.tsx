import * as React from "react";
import {useEffect, useState} from "react";
import {Button, Checkbox, Flex, Divider, Stack, Text, TextInput, Group, Code} from "@mantine/core";
import {Dropzone} from "@mantine/dropzone";
import {IconFileTypeCsv, IconUpload, IconX} from '@tabler/icons-react';

import {SomaImportOptions} from "./ImportSomasModal";
import {parseKeywords} from "../../../models/neuron";

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
        <Stack gap="lg">
            <Dropzone onDrop={onFileReceived} accept={["text/csv"]}>
                <Group justify="center" gap="xl" mih={220} style={{pointerEvents: 'none'}}>
                    <Dropzone.Accept>
                        <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5}/>
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5}/>
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        {file ?
                            <IconUpload size={52} color="var(--mantine-color-green-6)" stroke={1.5}/> :
                            <IconFileTypeCsv size={52} color="var(--mantine-color-dimmed)" stroke={1.5}/>
                        }
                    </Dropzone.Idle>

                    {file ? <Text size="xl" inline>{file.name}</Text> :
                        <div>
                            <Text size="xl" inline>
                                Drop a soma properties CSV file here or click to select a file
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                                Files should contain columns for <Code>xyz_raw, Brightness, Volume (µm³), Radii (μm), xyz_ccf_auto</Code>
                            </Text>
                        </div>
                    }
                </Group>
            </Dropzone>

            <div>
                <Checkbox checked={shouldApplyTag} label="Apply keyword(s) to candidates"
                          onChange={(event) => setShouldApplyTag(event.currentTarget.checked)}/>
                <TextInput label="Keyword(s)" description="Separate multiple keywords with a semicolon (;)" placeholder="AIND" disabled={!shouldApplyTag} value={tag}
                           onChange={(event) => setTag(event.currentTarget.value)}/>
            </div>

            <Checkbox checked={shouldLookupSoma} label="Use Atlas lookup for unspecified soma structures"
                      onChange={(event) => setShouldLookupSoma(event.currentTarget.checked)}/>

            <Divider my="md"/>

            <Flex justify="flex-end">
                <Button disabled={!canImport} rightSection={<IconUpload size={14}/>}
                        onClick={() => props.onImport({keywords: shouldApplyTag ? parseKeywords(tag) : null, shouldLookupSoma: shouldLookupSoma, file: file})}>
                    Import
                </Button>
            </Flex>
        </Stack>
    );
}
