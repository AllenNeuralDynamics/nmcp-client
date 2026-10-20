import * as React from "react";
import {observer} from "mobx-react-lite";
import {Group, MultiSelect, Text} from "@mantine/core";

import {CandidateFilter, CandidateIncludeOptions} from "../../viewmodel/candidateFilter";
import {statusNameOnly} from "../../models/reconstructionStatus";

const options = CandidateIncludeOptions.map(s => ({label: statusNameOnly(s), value: s.toString()}));

export const CandidateIncludeFilter = observer(({candidateFilter}: { candidateFilter: CandidateFilter }) => {
    const value = candidateFilter.includedStatuses.map(s => s.toString());

    return (
        <Group gap="sm" align="center">
            <Text size="sm">Include Additional</Text>

            <MultiSelect w={300} clearable placeholder={value.length == 0 ? "None" : null} aria-label="Include" data={options} value={value}
                         onChange={(value) => candidateFilter.includedStatuses = value.map(v => parseInt(v))}/>
        </Group>
    );
});
