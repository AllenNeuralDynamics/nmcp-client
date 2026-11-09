import * as React from "react";
import {Tabs} from "@mantine/core";
import {IconBinaryTree, IconBinaryTreeFilled, IconChecklist, IconFileInfo} from "@tabler/icons-react";

import {SpecimenSpace} from "./SpecimenSpace";
import {Annotation} from "../../../models/annotation";
import {AtlasSpace} from "./AtlasSpace";
import {Status} from "./Status";
import {QualityCheck} from "./QualityCheck";

type SelectionProps = {
    reconstruction: Annotation;
    tab: string;

    onTabChange(tab: string): void;
}

export const Selection = ({reconstruction, tab: savedTab, onTabChange}: SelectionProps) => {
    if (reconstruction == null) {
        return null
    }

    const hasQualityControl = !!reconstruction.atlasReconstruction?.qualityControl;
    const activeTab = (!hasQualityControl && savedTab === "quality") ? "status" : savedTab;

    return (
        <Tabs value={activeTab} onChange={tab => tab && onTabChange(tab)}>
            <Tabs.List>
                <Tabs.Tab value="status" leftSection={<IconFileInfo size={18}/>}>
                    Summary
                </Tabs.Tab>
                <Tabs.Tab value="specimen" leftSection={<IconBinaryTree size={18} style={{transform: "rotate(-90deg)"}}/>}>
                    Specimen-Space Reconstruction
                </Tabs.Tab>
                <Tabs.Tab value="atlas" leftSection={<IconBinaryTreeFilled size={18} style={{transform: "rotate(-90deg)"}}/>}>
                    Atlas-Space Reconstruction
                </Tabs.Tab>
                <Tabs.Tab value="quality" leftSection={<IconChecklist size={18}/>} disabled={!hasQualityControl}>
                    Quality Control
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="status" key={`status_${reconstruction.id}`}>
                <Status reconstruction={reconstruction}/>
            </Tabs.Panel>
            <Tabs.Panel value="specimen" key={`specimen_${reconstruction.id}`}>
                <SpecimenSpace reconstruction={reconstruction}/>
            </Tabs.Panel>
            <Tabs.Panel value="atlas" key={`atlas_${reconstruction.id}`}>
                <AtlasSpace reconstruction={reconstruction}/>
            </Tabs.Panel>
            <Tabs.Panel value="quality" key={`quality_${reconstruction.id}`}>
                <QualityCheck reconstruction={reconstruction} isActive={activeTab === "quality"}/>
            </Tabs.Panel>
        </Tabs>
    );
}


