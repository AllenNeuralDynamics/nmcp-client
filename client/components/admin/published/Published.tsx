import React from "react"
import {Space} from "@mantine/core";

import {Unpublish} from "./Unpublish";
import {PublishedTable} from "./PublishedTable";

export const Published = () => {
    return (
        <div>
            <Unpublish/>
            <Space h="md"/>
            <PublishedTable/>
        </div>
    )
}
