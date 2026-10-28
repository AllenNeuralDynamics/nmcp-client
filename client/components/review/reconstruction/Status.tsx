import * as React from "react";
import {Divider, Flex} from "@mantine/core";

import {Annotation} from "../../../models/annotation";
import {Metadata} from "./Metadata";

export const Status = ({reconstruction}: { reconstruction: Annotation }) => {
    return (
        <Flex>
            <Metadata reconstruction={reconstruction}/>
            <Divider orientation="vertical" />
        </Flex>
    )
}
