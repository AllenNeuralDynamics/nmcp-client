import React from "react";
import {Upload} from "./Upload";

import {ReconstructionSpace} from "../../../models/reconstructionSpace";
import {Reconstruction} from "../../../models/reconstruction";

export const SpecimenSpace = ({reconstruction}: { reconstruction: Reconstruction }) => {
    return <Upload reconstruction={reconstruction} space={ReconstructionSpace.Specimen}/>;
}
