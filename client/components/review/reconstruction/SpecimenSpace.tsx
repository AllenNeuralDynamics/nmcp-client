import React from "react";

import {Annotation} from "../../../models/annotation";
import {ReconstructionSpace} from "../../../models/reconstructionSpace";
import {ReconstructionUpload} from "../../common/ReconstructionUpload";

export const SpecimenSpace = ({reconstruction}: { reconstruction: Annotation }) => {
    return <ReconstructionUpload reconstruction={reconstruction} space={ReconstructionSpace.Specimen}/>;
}
