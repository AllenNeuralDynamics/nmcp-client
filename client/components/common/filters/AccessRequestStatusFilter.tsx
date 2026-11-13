import * as React from "react";
import {observer} from "mobx-react-lite";
import {Group, MultiSelect, Switch} from "@mantine/core";

import {OptionalFilter} from "../../../viewmodel/candidateFilter";
import {AccessRequestKind, AccessRequestStatus, accessRequestStatusName} from "../../../models/accessRequest";

// Pending is omitted while nothing in the workflow puts a request into that state.
export const AccessRequestStatusFilterOptions = [AccessRequestStatus.Unreviewed, AccessRequestStatus.Accepted, AccessRequestStatus.Denied];

// A message is only ever marked as responded, so Denied has no way in.
export const FeedbackStatusFilterOptions = [AccessRequestStatus.Unreviewed, AccessRequestStatus.Accepted];

function createOptions(allowed: AccessRequestStatus[], kind: AccessRequestKind): { label: string, value: string }[] {
    return allowed.map(a => {
        return {label: accessRequestStatusName(a, kind), value: a.toString()}
    });
}

type AccessRequestStatusFilterProps = {
    filter: OptionalFilter<AccessRequestStatus[]>,
    allowedValues?: AccessRequestStatus[],
    kind?: AccessRequestKind,
    w?: number
}

export const AccessRequestStatusFilter = observer(({filter, allowedValues = AccessRequestStatusFilterOptions, kind = AccessRequestKind.Access, w = null}: AccessRequestStatusFilterProps) => {
    const props = w ? {w: w} : {miw: 200};

    const options = createOptions(allowedValues, kind);

    const value = filter.contents.map(s => s.toString());

    return (
        <Group gap="sm" align="center" justify="stretch">
            <Switch label="Limit status" checked={filter.isEnabled} onChange={(event) => filter.isEnabled = event.currentTarget.checked}/>

            <MultiSelect {...props} clearable data={options} value={value}
                         disabled={!filter.isEnabled} onChange={(value) => filter.contents = value.map(v => parseInt(v))}/>
        </Group>
    );
});
