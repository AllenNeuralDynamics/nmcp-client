import React from "react";

import {Annotation} from "../../../models/annotation";
import {ReconstructionSpace} from "../../../models/reconstructionSpace";
import {Upload} from "./Upload";

export const AtlasSpace = ({reconstruction}: { reconstruction: Annotation }) => {
    return <Upload reconstruction={reconstruction} space={ReconstructionSpace.Atlas}/>;
}
