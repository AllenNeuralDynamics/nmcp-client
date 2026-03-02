import * as React from "react";
import {Divider, Flex, Stack, Text} from "@mantine/core";

import {Reconstruction} from "../../../models/reconstruction";
import {Metadata} from "./Metadata";
import {qualityControlStatus} from "../../../models/qualityControlStatus";

export const Status = ({reconstruction}: { reconstruction: Reconstruction }) => {
    return (
        <Flex>
            <Metadata reconstruction={reconstruction}/>
            <Divider orientation="vertical" />
        </Flex>
    )
}
