import * as React from "react";
import {Divider, Flex} from "@mantine/core";

import {Reconstruction} from "../../../models/reconstruction";
import {Metadata} from "./Metadata";

export const Status = ({reconstruction}: { reconstruction: Reconstruction }) => {
    return (
        <Flex>
            <Metadata reconstruction={reconstruction}/>
            <Divider orientation="vertical" />
        </Flex>
    )
}
