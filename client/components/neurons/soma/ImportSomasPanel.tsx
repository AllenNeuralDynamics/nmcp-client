import * as React from "react";
import {observer} from "mobx-react-lite";
import {Checkbox, Stack, Text, TextInput, Group, Code, NumberInput, SimpleGrid} from "@mantine/core";
import {Dropzone} from "@mantine/dropzone";
import {IconFileTypeCsv, IconJson, IconUpload, IconX} from '@tabler/icons-react';

import {ImportSomaData} from "../../../viewmodel/importSomaData";

const iconSize = 40;

export const ImportSomasPanel = observer(({importData}: { importData: ImportSomaData }) => {

    const onSomaFileDropped = (acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            importData.somaFile = acceptedFiles[0];
        } else {
            importData.somaFile = null;
        }
    }

    return (
        <Stack gap="lg">
            <Text>Soma Candidates</Text>
            <Dropzone onDrop={onSomaFileDropped} accept={["text/csv"]}>
                <Group justify="start" gap="sm" mih={120} style={{pointerEvents: 'none'}}>
                    <Dropzone.Accept>
                        <IconUpload size={iconSize} color="var(--mantine-color-blue-6)" stroke={1.5}/>
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <IconX size={iconSize} color="var(--mantine-color-red-6)" stroke={1.5}/>
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        {importData.somaFile ?
                            <IconUpload size={iconSize} color="var(--mantine-color-green-6)" stroke={1.5}/> :
                            <IconFileTypeCsv size={iconSize} color="var(--mantine-color-dimmed)" stroke={1.5}/>
                        }
                    </Dropzone.Idle>

                    {importData.somaFile ? <Text size="md" inline>{importData.somaFile.name}</Text> :
                        <div>
                            <Text size="md" inline>
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
                <Checkbox checked={importData.applyKeywords} label="Apply keyword(s) to candidates"
                          onChange={(event) => importData.applyKeywords = event.currentTarget.checked}/>
                <TextInput label="Keyword(s)" description="Separate multiple keywords with a semicolon (;)" placeholder="AIND"
                           disabled={!importData.applyKeywords}
                           value={importData.keywords} onChange={(event) => importData.keywords = event.currentTarget.value}/>
            </div>

            <Checkbox checked={importData.shouldLookupAtlasStructures} label="Use Atlas lookup for unspecified soma structures"
                      onChange={(event) => importData.shouldLookupAtlasStructures = event.currentTarget.checked}/>
        </Stack>
    );
});
