import * as React from "react";
import {useState} from "react";
import {observer} from "mobx-react-lite";
import {Stack, Text, Group, Code, NumberInput, SimpleGrid} from "@mantine/core";
import {Dropzone} from "@mantine/dropzone";
import {IconJson, IconUpload, IconX} from '@tabler/icons-react';

import {ImportSomaData} from "../../../viewmodel/importSomaData";

const iconSize = 40;

export const ImportSomaFeatures = observer(({importData}: { importData: ImportSomaData }) => {
    const [featuresFile, setFeaturesFile] = useState<File>(null);
    const [featuresMessage, setFeaturesMessage] = useState<string>(null);
    const [fileColor, setFileColor] = useState<string>("var(--mantine-color-red-6)");

    const onSomaFileDropped = async (acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            if (await importData.readFeaturesFile(acceptedFiles[0])) {
                setFeaturesMessage("Features have been parsed to the fields below");
                setFileColor("var(--mantine-color-green-6)");
            } else {
                setFeaturesMessage("The expected properties could not be parsed from the file.");
                setFileColor("var(--mantine-color-red-6)");
            }

            setFeaturesFile(acceptedFiles[0]);
        }
    }

    return (
        <Stack gap="sm">
            <Text>Specimen Soma Default Features</Text>

            <Dropzone onDrop={onSomaFileDropped} accept={["application/json"]}>
                <Group justify="start" gap="sm" mih={120} style={{pointerEvents: 'none'}}>
                    <Dropzone.Accept>
                        <IconUpload size={iconSize} color="var(--mantine-color-blue-6)" stroke={1.5}/>
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                        <IconX size={iconSize} color="var(--mantine-color-red-6)" stroke={1.5}/>
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                        {featuresFile ?
                            <IconUpload size={iconSize} color={fileColor} stroke={1.5}/> :
                            <IconJson size={iconSize} color="var(--mantine-color-dimmed)" stroke={1.5}/>
                        }
                    </Dropzone.Idle>

                    <div>
                        <Text size="md" inline>
                            {featuresFile ? featuresFile.name : "Drop a specimen default soma features JSON file here or click to select a file"}
                        </Text>
                        {featuresFile ? <Text size="sm" c="dimmed" inline mt={7}>{featuresMessage}</Text> :
                            <Text size="sm" c="dimmed" inline mt={7}>
                                Files should contain a single JSON object with properties <Code>Brightness</Code> and <Code>Volume</Code>
                            </Text>}
                    </div>
                </Group>
            </Dropzone>

            <SimpleGrid cols={2}>
                <NumberInput label="Brightness" min={0} hideControls value={importData.brightness} onChange={importData.setBrightness}/>

                <NumberInput label="Volume (µm³)" min={0} hideControls value={importData.volume} onChange={importData.setVolume}/>
            </SimpleGrid>
        </Stack>
    );
});
