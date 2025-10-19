import React from "react";
import {Upload} from "./Upload";

import {ReconstructionSpace} from "../../../models/reconstructionSpace";
import {Reconstruction} from "../../../models/reconstruction";

export const AtlasSpace = ({reconstruction}: { reconstruction: Reconstruction }) => {
    return <Upload reconstruction={reconstruction} space={ReconstructionSpace.Atlas}/>;
}
