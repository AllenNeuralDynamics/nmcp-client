import * as React from "react";
import {useState} from "react";
import {Tabs} from "@mantine/core";
import {IconBinaryTree, IconBinaryTreeFilled, IconFileInfo} from "@tabler/icons-react";

import {SpecimenSpace} from "./SpecimenSpace";
import {Reconstruction} from "../../../models/reconstruction";
import {Metadata} from "./Metadata";
import {AtlasSpace} from "./AtlasSpace";
import {Status} from "./Status";

export const Selection = ({reconstruction}: {reconstruction: Reconstruction}) => {
    const [activeTab, setActiveTab] = useState<string | null>("status");

    if (reconstruction == null) {
        return null
    }

    const onChangeTab = (tab: string) => {
        setActiveTab(tab);
    }

    return (
        <Tabs value={activeTab} onChange={onChangeTab}>
            <Tabs.List>
                <Tabs.Tab value="status" leftSection={<IconFileInfo size={18}/>}>
                    Status
                </Tabs.Tab>
                <Tabs.Tab value="specimen" leftSection={<IconBinaryTree size={18} style={{transform: "rotate(-90deg)"}}/>}>
                    Specimen-Space Reconstruction
                </Tabs.Tab>
                <Tabs.Tab value="atlas" leftSection={<IconBinaryTreeFilled size={18} style={{transform: "rotate(-90deg)"}}/>}>
                    Atlas-Space Reconstruction
                </Tabs.Tab>
                {/*
                <Tabs.Tab value="quality" leftSection={<IconBook size={18}/>}>
                    Quality Control
                </Tabs.Tab>
                */}
                {/*
                <Tabs.Tab value="history" leftSection={<IconBook size={18}/>}>
                    History
                </Tabs.Tab>
                */}
            </Tabs.List>

            <Tabs.Panel value="status">
                <Status key={`status_${reconstruction.id}`} reconstruction={reconstruction}/>
            </Tabs.Panel>
            <Tabs.Panel value="specimen">
                <SpecimenSpace key={`specimen_${reconstruction.id}`} reconstruction={reconstruction}/>
            </Tabs.Panel>
            <Tabs.Panel value="atlas">
                <AtlasSpace key={`atlas_${reconstruction.id}`} reconstruction={reconstruction}/>
            </Tabs.Panel>
        </Tabs>
    );

    /*
    return (
        <Stack align="stretch">
            {reconstruction.atlasReconstruction?.qualityCheck ? <QualityCheck key={reconstruction.id} reconstruction={reconstruction.atlasReconstruction}/> : null}
            <ModifyReconstruction key={reconstruction.id} reconstruction={reconstruction}/>
            <Space h={12}/>
        </Stack>
    );
*/
    /*
    return (
        <Stack align="stretch">
            {quality}
            <SimpleGrid cols={2}>
                <UploadReconstruction reconstruction={reconstruction} elementName={`create-view-container}`}/>
                <Card withBorder radius="md">
                    <Card.Section bg="segment" p={12}>
                        <div style={{display: "flex", flexDirection: "row"}}>
                            <Header style={{margin: 0, marginTop: "6px", verticalAlign: "middle"}}>Reconstruction Metadata</Header>
                            <div style={{order: 2, flexGrow: 1, flexShrink: 1}}/>
                            <div style={{order: 3, flexGrow: 0, flexShrink: 0, marginRight: "12px"}}>
                                <Button size="tiny" color="green" disabled={!canUpdate}
                                        onClick={onUpdateReconstruction}>Update</Button>
                            </div>
                        </div>
                    </Card.Section>
                    <Divider orientation="horizontal"/>
                    <Stack justify="space-between" h="100%" mt={12}>
                        <Stack>
                            <Group>
                                <div>
                                    <Header as="h5">Axon Source</Header>
                                    {axonIcon}{reconstruction.axon ? reconstruction.axon.filename : "(requires upload)"}
                                </div>
                                <div>
                                    <Header as="h5">Dendrite Source</Header>
                                    {dendriteIcon}{reconstruction.dendrite ? reconstruction.dendrite.filename : "(requires upload)"}
                                </div>
                            </Group>
                            <RequestReviewPanel id={reconstruction.id} data={state}
                                                updateChecks={updateChecks} updateLength={updateLength}
                                                updateNotes={updateNotes} updateDuration={updateDuration}/>
                        </Stack>
                        <Badge size="sm" color="gray">
                            {reconstruction.id}
                        </Badge>
                    </Stack>
                </Card>
            </SimpleGrid>
        </Stack>
    );*/
}


