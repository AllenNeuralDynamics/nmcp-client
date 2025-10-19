import * as React from "react";
import {observer} from "mobx-react-lite";
import {Divider, Group, Switch} from "@mantine/core";

import {NeuronTagFilter} from "../common/filters/NeuronTagFilter";
import {SpecimenFilter} from "../common/filters/SpecimenFilter";
import {AtlasStructureMultiSelectFilter} from "../common/filters/AtlasStructureMultiSelectFilter";
import {CandidateFilter} from "../../viewmodel/candidateFilter";

export const CandidateFilters = observer(({candidateFilter}: { candidateFilter: CandidateFilter }) => {
    return (
        <Group p={12} justify="left" align="center">
            <Switch label="Include in progress" key="in-progress-filter"
                    checked={candidateFilter.includeInProgress}
                    onChange={(event) => {
                        candidateFilter.includeInProgress = event.currentTarget.checked;
                    }}/>

            <Divider orientation="vertical"/>

            <SpecimenFilter w={160} filter={candidateFilter.samplesFilter}/>

            <Divider orientation="vertical"/>

            <AtlasStructureMultiSelectFilter w={300} filter={candidateFilter.atlasStructureFilter}/>

            <Divider orientation="vertical"/>

            <NeuronTagFilter filter={candidateFilter.tagFilter}/>
        </Group>
    );
})
