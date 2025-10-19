import * as React from "react";
import {Space, Stack} from "@mantine/core";

import {Neurons} from "./Neurons";
import {SpecimensTable} from "./samples/Specimens";

export const ManageNeurons = () => {
    return (
        <Stack m={16} gap="xl">
            <SpecimensTable/>
            <Neurons/>
            <Space h={8}/>
        </Stack>
    );
};
