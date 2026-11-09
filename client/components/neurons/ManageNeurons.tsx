import * as React from "react";
import {Space, Stack} from "@mantine/core";

import {Neurons} from "./Neurons";
import {SpecimensTable} from "../specimens/Specimens";
import {usePageSettings} from "../../hooks/usePageSettings";
import {sectionOf} from "../../util/pageSettings";
import {AddSpecimensSettings} from "./addSpecimensSettings";

export const ManageNeurons = () => {
    const [settings, update] = usePageSettings(AddSpecimensSettings);

    return (
        <Stack m={16} gap="xl">
            <SpecimensTable settings={settings.specimens} onSettingsChange={sectionOf(update, "specimens")}/>
            <Neurons settings={settings.neurons} onSettingsChange={sectionOf(update, "neurons")}/>
            <Space h={8}/>
        </Stack>
    );
};
