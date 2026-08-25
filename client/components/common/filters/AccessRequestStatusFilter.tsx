import * as React from "react";
import {observer} from "mobx-react-lite";
import {Group, MultiSelect, Switch} from "@mantine/core";

import {OptionalFilter} from "../../../viewmodel/candidateFilter";
import {AccessRequestStatus, accessRequestStatusName} from "../../../models/accessRequest";

const defaultAllowedValues = [AccessRequestStatus.Unreviewed, AccessRequestStatus.Pending, AccessRequestStatus.Accepted, AccessRequestStatus.Denied];

function createOptions(allowed: AccessRequestStatus[]): { label: string, value: string }[] {
    return allowed.map(a => {
        return {label: accessRequestStatusName(a), value: a.toString()}
    });
}

type AccessRequestStatusFilterProps = {
    filter: OptionalFilter<AccessRequestStatus[]>,
    allowedValues?: AccessRequestStatus[],
    w?: number
}

export const AccessRequestStatusFilter = observer(({filter, allowedValues = defaultAllowedValues, w = null}: AccessRequestStatusFilterProps) => {
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
