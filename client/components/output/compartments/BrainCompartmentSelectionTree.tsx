import * as React from "react";

import {NdbConstants} from "../../../models/constants";
import {BrainCompartmentViewModel} from "../../../viewmodel/brainCompartmentViewModel";
import {Compartments} from "./Compartments";
import {CompartmentNode} from "./CompartmentNode";

export interface IBrainAreaGeometryProps {
    constants: NdbConstants;
    visibleBrainAreas: BrainCompartmentViewModel[];
    rootNode: CompartmentNode;

    onChangeLoadedGeometry(added: string[], removed: string[]): void;
}

export const BrainCompartmentSelectionTree = (props: IBrainAreaGeometryProps) => (
    <Compartments rootNode={props.rootNode} visibleBrainAreas={props.visibleBrainAreas} onChangeLoadedGeometry={props.onChangeLoadedGeometry}/>
);
