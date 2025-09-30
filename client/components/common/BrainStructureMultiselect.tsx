import * as React from "react";

import {IBrainArea} from "../../models/brainArea";

export type BrainStructureMultiSelectProps = {
    selection: IBrainArea[];
    disabled?: boolean;

    onSelectionChange(selection: IBrainArea[]): void;
}

export const BrainStructureMultiSelect: React.FC<BrainStructureMultiSelectProps> = ({selection, disabled}) => {
    return (<div/>);
}
