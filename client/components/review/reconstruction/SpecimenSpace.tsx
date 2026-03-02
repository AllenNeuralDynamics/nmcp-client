import React from "react";

import {Reconstruction} from "../../../models/reconstruction";
import {ReconstructionSpace} from "../../../models/reconstructionSpace";
import {Upload} from "./Upload";

export const SpecimenSpace = ({reconstruction}: { reconstruction: Reconstruction }) => {
    return <Upload reconstruction={reconstruction} space={ReconstructionSpace.Specimen}/>;
}
