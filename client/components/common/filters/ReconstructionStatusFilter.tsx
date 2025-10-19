import * as React from "react";
import {observer} from "mobx-react-lite";
import {Group, MultiSelect, Switch} from "@mantine/core";

import {OptionalFilter} from "../../../viewmodel/candidateFilter";
import {ReconstructionStatus, statusName} from "../../../models/reconstructionStatus";

function createOptions(allowed: ReconstructionStatus[]): { label: string, value: string }[] {
    return allowed.map(a => {
        return {label: statusName(a), value: a.toString()}
    });
}

type ReconstructionStatusFilterProps = {
    filter: OptionalFilter<ReconstructionStatus[]>,
    allowedValues: ReconstructionStatus[],
    w?: number
}

export const ReconstructionStatusFilter = observer(({filter, allowedValues, w = null}: ReconstructionStatusFilterProps) => {
    const props = w ? {w: w} : {miw: 200};

    const options = createOptions(allowedValues);

    const value = filter.contents.map(s => s.toString());

    return (
        <Group gap="sm" align="center" justify="stretch">
            <Switch label="Limit status" checked={filter.isEnabled} onChange={(event) => filter.isEnabled = event.currentTarget.checked}/>

            <MultiSelect {...props} clearable data={options} value={value}
                         disabled={!filter.isEnabled} onChange={(value) => filter.contents = value.map(v => parseInt(v))}/>
        </Group>
    );
});
