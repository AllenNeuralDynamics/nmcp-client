import * as React from "react";
import {Divider, Flex, Stack, Text} from "@mantine/core";

import {Reconstruction} from "../../../models/reconstruction";
import {Metadata} from "./Metadata";
import {qualityControlStatus} from "../../../models/qualityControlStatus";

export const Status = ({reconstruction}: { reconstruction: Reconstruction }) => {
    return (
        <Flex>
            <Stack miw={300}>
                {/* <Text>{qualityControlStatus(reconstruction.atlasReconstruction.qualityControl?.status)}</Text>*/}
            </Stack>
            <Divider orientation="vertical" />
            <Metadata reconstruction={reconstruction}/>
        </Flex>
    )
}
