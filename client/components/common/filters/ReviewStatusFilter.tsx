import * as React from "react";
import {observer} from "mobx-react-lite";
import {Group, MultiSelect, Switch} from "@mantine/core";

import {OptionalFilter} from "../../../viewmodel/candidateFilter";
import {ReviewStatusEntry, selectedReviewEntries} from "../../review/reviewAccess";

type ReviewStatusFilterProps = {
    filter: OptionalFilter<string[]>,
    available: ReviewStatusEntry[],
    w?: number
}

export const ReviewStatusFilter = observer(({filter, available, w = null}: ReviewStatusFilterProps) => {
    const props = w ? {w: w} : {miw: 200};

    const options = available.map(e => ({label: e.label, value: e.value}));

    const value = selectedReviewEntries(available, filter.contents).map(e => e.value);

    // Keep what is stored but not offered, so a choice hidden by Approval Only returns when the switch is turned off.
    const onChange = (next: string[]) => {
        const hidden = (filter.contents ?? []).filter(v => !options.some(o => o.value == v));

        filter.contents = [...hidden, ...next];
    };

    return (
        <Group gap="sm" align="center" justify="stretch">
            <Switch label="Limit status" checked={filter.isEnabled} onChange={(event) => filter.isEnabled = event.currentTarget.checked}/>

            <MultiSelect {...props} clearable data={options} value={value}
                         disabled={!filter.isEnabled} onChange={onChange}/>
        </Group>
    );
});
