import * as React from "react";
import {observer} from "mobx-react-lite";
import {Group, Select, Switch} from "@mantine/core";

import {OptionalFilter} from "../../../viewmodel/candidateFilter";
import {NeuronStatus} from "../../../models/neuron";

function createOptions(): { label: string, value: string }[] {
    const options = [];

    options.push({label: "Unpublished", value: NeuronStatus.Unpublished.toString()});

    options.push({label: "Published", value: NeuronStatus.Published.toString()});

    return options;
}

export const NeuronStatusFilter = observer(({filter, w = null}: { filter: OptionalFilter<NeuronStatus>, w?: number }) => {
    const props = w ? {w: w} : {miw: 200};

    const options = createOptions();

    const value = filter.contents.toString();

    return (
        <Group gap="sm" align="center" justify="stretch">
            <Switch label="Status" checked={filter.isEnabled} onChange={(event) => filter.isEnabled = event.currentTarget.checked}/>

            <Select {...props} data={options} value={value} disabled={!filter.isEnabled}
                    onChange={(value: string) => filter.contents = parseInt(value)}/>
        </Group>
    );
});
