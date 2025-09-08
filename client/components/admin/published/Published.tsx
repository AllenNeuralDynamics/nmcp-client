import React from "react"

import {Unpublish} from "./Unpublish";
import {PublishedTable} from "./PublishedTable";

export const Published = () => {
    return (
        <div>
            <Unpublish/>
            <PublishedTable/>
        </div>
    )
}
